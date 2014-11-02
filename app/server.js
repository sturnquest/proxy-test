const url = require("url");
const http = require("http");

var Recorder = require("./recorder.js");
var response = require("./responses.js");

var recorder = new Recorder();

var server = http.createServer(function(req, res) {
    var path = url.parse(req.url).path;

    console.log("Received request for path: " + path);

    var tokens = path.split("/");
    if (tokens[1] == "replay") {
        path = "/" + tokens.slice(2).join("/");
        console.log("Replay content for path: " + path);
    } else {
        recorder.put(path, req, response(path).generate());
    }

    var content = recorder.get(path);
    if (content === undefined) {
        content = {response: {status: 404, headers: {}}}
    }

    res.writeHead(content.response.status, content.response.headers);
    res.end(JSON.stringify(content));
});

exports.server = server;