const request = require("request");
const querystring = require("querystring");
const errors = require("./errors");
const promisify = require("potpourri/dist/es5").promisify;

module.exports = class {
  constructor(apiKey) {
    if (!apiKey) throw new Error("No API key provided");
    this._apiKey = apiKey;
  }

  getUserItems(userId) {
    return promisify(request)(this._getUserUrl(userId)).then(response => {
      var json = JSON.parse(response.body);
      var jsonError = this._getJsonError(json);
      if (jsonError) throw jsonError;
      return json.items || [];
    });
  }

  _getUserUrl(userId) {
    return (
      "https://www.googleapis.com/plus/v1/people/" +
      encodeURIComponent(userId) +
      "/activities/public?" +
      querystring.stringify({ key: this._apiKey })
    );
  }

  _getJsonError(json) {
    if (json.error) {
      var ErrorType = (function() {
        if (json.error.code >= 500) return errors.ServerError;
        if (json.error.code == 404) return errors.NotFoundError;
        if (json.error.code >= 400) return errors.UserError;
        return Error;
      })();
      return new ErrorType("[Google+ error] " + json.error.message);
    }
  }
};
