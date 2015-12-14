'use strict';

var request = require('request');
var querystring = require('querystring');
var errors = require('./errors');
const util = require('./util');

var Plus = module.exports = function(apiKey) {
    if (!apiKey) throw new Error('No API key provided');
    this._apiKey = apiKey;
};

Plus.prototype.getUserItems = function(userId) {
    return util.promisify(request)(this._getUserUrl(userId)).then(response => {
        var json = JSON.parse(response.body);
        var jsonError = this._getJsonError(json);
        if (jsonError) throw jsonError;
        return json.items || [];
    });
};

Plus.prototype._getUserUrl = function (userId) {
    return 'https://www.googleapis.com/plus/v1/people/' + encodeURIComponent(userId) +
        '/activities/public?' + querystring.stringify({key: this._apiKey});
};

Plus.prototype._getJsonError = function (json) {
    if (json.error) {
        var ErrorType = function() {
            if (json.error.code >= 500) return errors.ServerError;
            if (json.error.code == 404) return errors.NotFoundError;
            if (json.error.code >= 400) return errors.UserError;
            return Error;
        }();
        return new ErrorType("[Google+ error] " + json.error.message);
    }
};
