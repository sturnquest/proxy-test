const chai = require("chai");
const expect = chai.expect;

const url = require("url");
const request = require('request');
const exec = require('child_process').exec;
const sleep = require('sleep');

var proxyBaseUrl = "http://localhost:2000";
var replayBaseUrl = "http://localhost:8080/replay";
var child;

beforeEach(function() {
    child = exec("ruby ~/projects/proxy/app/transparent_proxy.rb");

    // Don't like haveing to sleep here but we need to allow some time for the process to startup
    // before we hit the proxy server
    sleep.sleep(1);
})

afterEach(function() {
    child.kill();
});


describe("Proxy", function() {

    it("forwards request headers", function(done) {

        var path = "/proxy/a";
        var proxyUrl = url.parse(proxyBaseUrl + path);
        var expectedRequestHeaders = {"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "accept-language":"en-US,en;q=0.8", "cache-control": "max-age=0", "connection": "keep-alive",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36"};

        // Make a request to the proxy
        request({url: proxyUrl, headers: expectedRequestHeaders}, function(error) {
            expect(error).to.not.exist;

            // Now check that the proxy forwarded the request headers to our destination server
            var replayUrl =replayBaseUrl + path;
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

    // forwards response headers for content type
    // forwards response headers unaltered
    // returns correct status code

})
