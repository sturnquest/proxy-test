var Recorder = function () {
    this.memory = {};
};

Recorder.prototype = {
    constructor: Recorder,

    put: function(path, request, response) {
        this.memory[path] = {request: {headers: request.headers, method: request.method}, response: response};
    },

    get: function(path) {
        return this.memory[path];
    }
};



module.exports = Recorder;