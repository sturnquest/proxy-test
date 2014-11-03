const url = require("url");
const http = require("http");

var Recorder = require("./recorder.js");
var response = require("./responses.js");

var recorder = new Recorder();

var server = http.createServer(function(req, res) {
    var path = url.parse(req.url).path;

    var content, body;
    var tokens = path.split("/");

    if (tokens[1] == "replay") {
        path = "/" + tokens.slice(2).join("/");
        content = recorder.get(path);
        body = content;
    } else {
        content = recorder.put(path, req, response(path).generate());
        body = content.response.body;
    }

    if (content === undefined) {
        content = {response: {status: 404, headers: {}}}
        body = content;
    }

    res.writeHead(content.response.status, content.response.headers);
    res.end(JSON.stringify(body));
});

exports.server = server;