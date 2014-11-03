var uuid = require('node-uuid');

function SizeResponse(contentLength, path) {

    this.contentLength = contentLength;
    this.path = path;

    this.generate = function() {
        var body = '';
        var maxLengthWithBufferForQuotes = (this.contentLength - 2);
        for (var i = 0; i < maxLengthWithBufferForQuotes; i++) {
            body += '1';
        }

        return {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",  "x-request-type": "content-length",
            "content-type": "text/html", "x-id": uuid.v4(), "x-path": this.path}, body: body, status: 200};
    }

};

var ContentTypeResponse = function(contentType) {

    this.contentType = contentType;

    this.generate = function() {
        return {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",  "x-request-type": "content-type",
            "content-type": this.contentType}, body: {description: "The requested content type is: " + this.contentType, date: new Date()}, status: 200};
    }

};

var StatusResponse = function(status) {

    this.status = status;

    this.generate = function() {
        return {headers: {status: this.status, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",  "x-request-type": "status-code",
            "content-type": "text/html"}, body: {description: "The requested status code is: " + this.contentType, date: new Date()}, status: this.status};
    }

};

var GenericResponse = function(path) {

    this.path = path;

    this.generate = function() {
        return {headers: {status: 200, server: "Earnest Proxy Tester", "x-powered-by": "Earnest",
            "x-request-type": "generic", "content-type": "text/html"},
            body: {description: "The rain in spain falls mainly in the plain.", path: this.path, date: new Date(), id: uuid.v4()}, status: 200};
    }

};

var response = function(path) {
    var tokens = path.substring(1).split("/");
    switch (tokens[0].toLowerCase()) {
        case "content-length":
            return new SizeResponse(new Number(tokens[1]).valueOf(), path);
        case "content-type":
            tokens.shift();
            return new ContentTypeResponse(tokens.join("/"));
            break;
        case "status-code":
            return new StatusResponse(new Number(tokens[1]).valueOf());
        default:
            return new GenericResponse("/" + tokens.join("/"));
        }
};



module.exports = response;