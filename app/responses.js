function SizeResponse(contentLength) {

    this.contentLength = contentLength;

    this.generate = function() {
        var content = '';
        for (var i = 0; i < this.contentLength; i++) {
            content += '1';
        }

        return {headers: {status: 200, server: "Earnest Proxy Tester", "X-Powered-By": "Earnest",  "X-Request-Type": "content-length",
            "content-type": "text/html"}, content: content, status: 200};
    }

};

var ContentTypeResponse = function(contentType) {

    this.contentType = contentType;

    this.generate = function() {
        return {headers: {status: 200, server: "Earnest Proxy Tester", "X-Powered-By": "Earnest",  "X-Request-Type": "content-type",
            "content-type": this.contentType}, content: {description: "The requested content type is: " + this.contentType, date: new Date()}, status: 200};
    }

};

var StatusResponse = function(status) {

    this.status = status;

    this.generate = function() {
        return {headers: {status: this.status, server: "Earnest Proxy Tester", "X-Powered-By": "Earnest",  "X-Request-Type": "status-code",
            "content-type": "text/html"}, content: {description: "The requested status code is: " + this.contentType, date: new Date()}, status: this.status};
    }

};

var GenericResponse = function(path) {

    this.path = path;

    this.generate = function() {
        return {headers: {status: 200, server: "Earnest Proxy Tester", "X-Powered-By": "Earnest",
            "X-Request-Type": "generic", "content-type": "text/html"},
            content: {description: "The rain in spain falls mainly in the plain. Path: " + this.path, date: new Date()}, status: 200};
    }

};

var response = function(path) {
    var tokens = path.substring(1).split("/");
    switch (tokens[0].toLowerCase()) {
        case "content-length":
            return new SizeResponse(new Number(tokens[1]).valueOf());
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