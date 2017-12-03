"use strict";

var util = require("util");

/**
 * @param {Object} params
 * @param {string} [params.name] 'CustomError' by default
 * @param {Error} [params.parent] 'Error' by default
 * @param {function} [params.constructor] A no-op function by default
 */
var createError = function(params) {
  var CustomError = function() {
    this.name = params.name || "CustomError";
    Error.captureStackTrace(this, this.constructor);
    if (params.constructor) params.constructor.apply(this, arguments);
  };
  util.inherits(CustomError, params.parent || Error);
  return CustomError;
};

/**
 * An error caused by the user of the function
 */
var UserError = (exports.UserError = createError({
  name: "UserError",
  constructor: function(message) {
    this.message = message || "User error";
  }
}));

/**
 * A generic "Not found" error
 */
exports.NotFoundError = createError({
  name: "NotFoundError",
  parent: UserError,
  constructor: function(message) {
    this.message = message || "Not found";
  }
});

/**
 * An error caused by the server
 */
exports.ServerError = createError({
  name: "ServerError",
  constructor: function(message) {
    this.message = message || "Internal Error";
  }
});

exports.stringify = function(error) {
  return error instanceof Error ? error.stack : String(error);
};
