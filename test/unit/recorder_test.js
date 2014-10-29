const chai = require("chai");
const expect = chai.expect;
var Recorder = require("../../app/recorder.js");

describe("Recorder", function(){

    it("plays back request and response content", function() {

        var recorder = new Recorder();
        var request = {
            headers: {
                accept: "text/html,application/xhtml+xml", connection: "keep-alive",
                "Accept-Encoding": "gzip,deflate,sdch", "Cache-Control": "max-age=0",
                "Connection": "keep-alive", "User-Agent": "Mozilla/5.0 (Macintosh"
            },
            method: "GET"
        };
        var response = {
            headers: {"Cache-Control": "no-cache", "Content-Type": "text/html; charset=utf-8",
                "ETag": "2a8bd7f220529b18b77f59dd34095d98", "Expires": "Any Date"},
            content: "Any random string",
            status: 200
        };

        var path = "/any/random/path";

        var expectedContent = {request: {headers: request.headers, method: request.method},
            response: {headers: response.headers, content: response.content, status: response.status}};

        recorder.put(path, request, response);
        var content = recorder.get(path)

        expect(expectedContent).to.deep.equal(content);
    })

})

