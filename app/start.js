require('./server.js').proxy.listen(8080, function() {
    console.log("Recording Server listening on port: 8080");
});
