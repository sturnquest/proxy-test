const chai = require("chai");
const expect = chai.expect;
const request = require('request');
const server = require("./../../app/server.js").server;
const Q = require('q');

var proxyBaseUrl = "http://localhost:2000";
var replayBaseUrl = "http://localhost:8080/replay";

var proxyCacheMaxElementCount = 4; // count must match the setting used in the proxy under test. make this > 2 so the size test works.
var proxyTimeoutSeconds = 2; // seconds must match the setting used in the proxy under test
var proxyMaxSizeBytes = 1024; // size must match the setting used in the proxy under test


beforeEach(function() {
    server.listen(8080, function() {
        console.log("Recording Server listening on port: 8080");
    });

    // Clear the proxies cache
    request(proxyBaseUrl + "/cache", function(error) {});
})

afterEach(function() {
    server.close();
});


describe("Proxy", function() {

    it("forwards request headers to target server", function(done) {
        var path = "/proxy/a";
        var proxyUrl = proxyBaseUrl + path;
        var expectedRequestHeaders = {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "accept-language":"en-US,en;q=0.8", "cache-control": "max-age=0", "connection": "keep-alive",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"};

        // Make a request to the proxy
        request({url: proxyUrl, headers: expectedRequestHeaders}, function() {

            // Now check that the proxy forwarded the request headers to our destination server
            var replayUrl = replayBaseUrl + path;
            request(replayUrl, function(error, response, body) {

                var content = JSON.parse(body);
                var requestHeaders = content.request.headers;

                Object.keys(expectedRequestHeaders).forEach(function(key) {
                    expect(expectedRequestHeaders[key]).to.equal(requestHeaders[key]);
                });

                done();
            });
        });
    })

    it("sends response headers to client", function(done) {
        var path = "/proxy/b";
        var proxyUrl = proxyBaseUrl + path;

        // Make a request to the proxy
        request({url: proxyUrl}, function(error, response) {

            var responseHeaders = response.headers;
            expect(responseHeaders).to.have.property("server", "Earnest Proxy Tester");
            expect(responseHeaders).to.have.property("x-powered-by", "Earnest");

            done();
        });
    })

    it("responds with correct content type", function(done) {
        var path = "/content-type/application/earnest";
        var proxyUrl = proxyBaseUrl + path;

        // Make a request to the proxy
        request({url: proxyUrl}, function(error, response) {
            expect(response.headers['content-type']).to.equal("application/earnest");
            done();
        });
    })

    it("responds with correct status code", function(done) {
        var path = "/status-code/304";
        var proxyUrl = proxyBaseUrl + path;

        // Make a request to the proxy
        request({url: proxyUrl}, function(error, response, body) {
            console.log("error: " + error);
            console.log("status code: " + response.statusCode);

            expect(response.statusCode).to.equal(304);
            done();
        });
    })

    it("does not exceed cache element count capacity", function(done) {
        var pathIds = {};
        var snapshot = {};

        var mapResponse = function(proxyUrl) {
            return Q.nfcall(request, proxyUrl).then(function(response) {
                var body = response[1];
                pathIds[JSON.parse(body).path] = JSON.parse(body).id;
                return pathIds;
            })
        }

        var requestsToFillCache = []
        for(var i = 0; i < proxyCacheMaxElementCount; i++) {
            requestsToFillCache.push(mapResponse(proxyBaseUrl + '/element/' + i));
        }

        var requestOneMoreForCacheMiss = function() {
            return mapResponse(proxyBaseUrl + '/extra/element');
        }

        var createSnapshot = function() {
            snapshot = JSON.parse(JSON.stringify(pathIds));
        }

        var repeatAllRequests = function() {
            var repeatRequests = Object.keys(pathIds).map(function (path) {
                return mapResponse(proxyBaseUrl + path);
            });
            return Q.all(repeatRequests);
        }

        var verify = function() {
            expect(pathIds['/element/0']).to.equal(snapshot['/element/0']);
            expect(pathIds['/element/1']).to.equal(snapshot['/element/1']);
            expect(pathIds['/extra/element']).to.not.equal(snapshot['/extra/element']);
        }

        Q.all(requestsToFillCache)
            .then(requestOneMoreForCacheMiss)
            .then(createSnapshot)
            .then(repeatAllRequests)
            .then(verify)
            .done(done);
    })

    it("expires cache elements", function(done) {
        var expectedId;

        var requestForKnownPath = function() {
            return Q.nfcall(request, proxyBaseUrl + '/test/timeout').then(function(response) {
                var body = response[1];
                return JSON.parse(body).id;
            })
        }

        var setExpectedId = function(id) {
            expectedId = id;
        }

        var verify = function(id) {
            expect(id).to.equal(expectedId);
        }

        var verifyCacheExpired = function(id) {
            expect(id).to.not.equal(expectedId);
        }

        var expireCacheDelayMillis = (proxyTimeoutSeconds + 1) * 1000;

        requestForKnownPath()
            .then(setExpectedId)
            .then(requestForKnownPath)
            .then(verify)
            .delay(expireCacheDelayMillis)
            .then(requestForKnownPath)
            .then(verifyCacheExpired)
            .done(done);
    })

    it("does not allow the cache to exceed the total max size", function(done) {
        var pathIds = {};
        var snapshot = {};

        var mapResponse = function(proxyUrl) {
            return Q.nfcall(request, proxyUrl).then(function(response) {
                var body = JSON.parse(response[1]);

                pathIds[body.path] = body.id;
                return pathIds;
            })
        }

        var elementSizeBytes = proxyMaxSizeBytes / 2;
        var requestsToFillCache = []
        for(var i = 0; i < 2; i++) {
            requestsToFillCache.push(mapResponse(proxyBaseUrl + '/content-length/' + elementSizeBytes + '/' + i));
        }

        var requestOneMoreForCacheMiss = function() {
            return mapResponse(proxyBaseUrl + '/content-length/' + elementSizeBytes + '/extra');
        }

        var createSnapshot = function() {
            snapshot = JSON.parse(JSON.stringify(pathIds));
        }

        var repeatAllRequests = function() {
            var repeatRequests = Object.keys(pathIds).map(function (path) {
                return mapResponse(proxyBaseUrl + path);
            });
            return Q.all(repeatRequests);
        }

        var verify = function() {
            expect(pathIds['/content-length/' + elementSizeBytes + '/0']).to.equal(snapshot['/content-length/' + elementSizeBytes + '/0']);
            expect(pathIds['/content-length/' + elementSizeBytes + '/1']).to.equal(snapshot['/content-length/' + elementSizeBytes + '/1']);
            expect(pathIds['/content-length/' + elementSizeBytes + '/extra']).to.not.equal(snapshot['/content-length/' + elementSizeBytes + '/extra']);
        }

        Q.all(requestsToFillCache)
            .then(requestOneMoreForCacheMiss)
            .then(createSnapshot)
            .then(repeatAllRequests)
            .then(verify)
            .done(done);
    })

    it("does not put individual items in the cache that are too large", function(done) {

        var previousId;

        var exceedCacheSizeBytes = proxyMaxSizeBytes + 1;
        var requestForLargeContent = function() {
            return Q.nfcall(request, proxyBaseUrl + '/content-length/' + exceedCacheSizeBytes).then(function(response) {
                response = response[0];

                return response.headers['x-id'];
            })
        }

        var setPreviousId = function(id) {
            previousId = id;
        }

        var verifyCacheMiss = function(id) {
            expect(id).to.not.equal(previousId);
        }

        requestForLargeContent()
            .then(setPreviousId)
            .then(requestForLargeContent)
            .then(verifyCacheMiss)
            .done(done);

    })

})

