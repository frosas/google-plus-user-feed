'use strict';

var request = require('request');
var querystring = require('querystring');
var errors = require('./errors');
var Q = require('q');

var Plus = module.exports = function(apiKey) {
    if (!apiKey) throw new Error('No API key provided');
    this._apiKey = apiKey;
};

Plus.prototype.getUserItems = function(userId) {
    var plus = this;
    return this._request(this._getUserUrl(userId)).then(function (result) {
        var json = JSON.parse(result.body);
        var jsonError = plus._getJsonError(json);
        if (jsonError) throw jsonError;
        return json.items || [];
    });
};

Plus.prototype._getUserUrl = function (userId) {
    return 'https://www.googleapis.com/plus/v1/people/' + userId +
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

Plus.prototype._request = function (url) {
    return Q.nfcall(request, url).then(function (result) {
        return {response: result[0], body: result[1]};
    });
};