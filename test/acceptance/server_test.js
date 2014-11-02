const chai = require("chai");
const expect = chai.expect;
const request = require('request');
const server = require("./../../app/server.js").server;
const Q = require('q');

var proxyBaseUrl = "http://localhost:2000";
var replayBaseUrl = "http://localhost:8080/replay";

var proxyCacheMaxElementCount = 2;


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
        request({url: proxyUrl, headers: expectedRequestHeaders}, function(error) {
            expect(error).to.not.exist;

            // Now check that the proxy forwarded the request headers to our destination server
            var replayUrl = replayBaseUrl + path;
            request(replayUrl, function(error, response, body) {
                expect(error).to.not.exist;

                var content = JSON.parse(body);
                console.log('content: ' + body);
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
            expect(error).to.not.exist;

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

    it("does not cache more than the max allowed elements", function(done) {
        var pathIds = {};
        var snapshot = {};

        var mapResponse = function(proxyUrl) {
            return Q.nfcall(request, proxyUrl).then(function(response) {
                var body = response[1];
                pathIds[JSON.parse(body).response.content.path] = JSON.parse(body).response.content.id;
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

})

