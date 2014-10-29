const chai = require("chai");
const expect = chai.expect;
const url = require("url");

var proxyUrl = "http://localhost:2000";
var endPointUrl = "http://localhost:8080";

describe("Proxy", function(){

    it("replays request headers", function() {

        var relativePath = "/any/path";
        var path = url.parse(proxyUrl + relativePath)
        //var requestHeaders =

        var req = http.request({hostname: proxiedUrl.hostname, path: uri.path, headers: request.headers}, function(res) {
            var r = {}
            r.headers = res.headers;
            r.status = res.statusCode;

            var data = []
            res.on('data', function(chunk) {
                data.push(chunk);
            });

            res.on('end', function() {
                var buffer = Buffer.concat(data);
                r.body = buffer
                cache.put(r)
                deferred.resolve(r);
            });
        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });

        req.end();

        expect(expectedContent).to.deep.equal(content);
    })

})

