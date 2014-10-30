const chai = require("chai");
const expect = chai.expect;

const request = require('request');
const exec = require('child_process').exec;
const sleep = require('sleep');

var proxyBaseUrl = "http://localhost:2000";
var replayBaseUrl = "http://localhost:8080/replay";
var child;

var proxy = require("./../../app/server.js").proxy;

beforeEach(function() {
    proxy.listen(8080, function() {
        console.log("Recording Server listening on port: 8080");
    });
    child = exec("ruby ~/projects/proxy/app/transparent_proxy.rb");

    // Don't like haveing to sleep here but we need to allow some time for the
    // child process to startup before we hit the proxy server
    sleep.sleep(2);
})

afterEach(function() {
    child.kill();
    proxy.close();
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
        var maxElementCount = 2;

        for(var i = 0; i < maxElementCount; i++) {

        }

        done();
    })

})

