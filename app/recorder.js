var Recorder = function () {
    this.memory = {};
};

Recorder.prototype = {
    constructor: Recorder,

    put: function(path, request, response) {
        var content = {request: {headers: request.headers, method: request.method}, response: response};
        this.memory[path] = content;
        return content;
    },

    get: function(path) {
        return this.memory[path];
    }
};



module.exports = Recorder;