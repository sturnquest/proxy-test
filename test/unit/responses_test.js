const chai = require("chai");
const expect = chai.expect;
var response = require("../../app/responses.js");

describe("Response", function(){

    it("generates a response with the requested size", function() {

        var expectedResponse = {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",
            "x-request-type": "content-length", "content-type": "text/html"}, content: "11111111111", status: 200};

        expect(expectedResponse).to.deep.equal(response("/content-length/11").generate());
    })

    it("generates a response with the requested content type", function() {

        var expectedResponse = {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",
            "x-request-type": "content-type", "content-type": "application/x-earnest"},
            content: {description: "The requested content type is: application/x-earnest", date: new Date()}, status: 200};

        var r = response("/content-type/application/x-earnest").generate();
        expect(expectedResponse.headers).to.deep.equal(r.headers);
        expect(expectedResponse.status).to.equal(r.status);
        expect(expectedResponse.content).to.have.property("description", "The requested content type is: application/x-earnest");
    })

    it("generates a response with the requested status code", function() {

        var expectedResponse = {headers: {status: 304, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",
            "x-request-type": "status-code", "content-type": "text/html"},
            content: {description: "The requested status code is: 304", date: new Date()}, status: 304};

        var r = response("/status-code/304").generate();
        expect(expectedResponse.headers).to.deep.equal(r.headers);
        expect(expectedResponse.status).to.equal(r.status);
        expect(expectedResponse.content).to.have.property("description", "The requested status code is: 304");
    })

    it("generates an ok response with a generic message", function() {

        ["/", "", "/any/path"].forEach(function(path) {
            var expectedResponse = {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",
                "x-request-type": "generic", "content-type": "text/html"},
                content: {description: "The rain in spain falls mainly in the plain. Path: " + path, date: new Date()}, status: 200};

            var r = response(path).generate();
            expect(expectedResponse.headers).to.deep.equal(r.headers);
            expect(expectedResponse.status).to.equal(r.status);
            expect(expectedResponse.content).to.have.property("description", "The rain in spain falls mainly in the plain. Path: " + path);
        });
    })



})

