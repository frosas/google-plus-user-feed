'use strict';

/**
 * An error caused by the user of the function
 */
exports.UserError = function(message) {
    this.name = 'UserError';
    this.message = message || 'User error';
};
exports.UserError.prototype = new Error;

/**
 * A generic "Not found" error
 */
exports.NotFoundError = function(message) {
    this.name = 'NotFoundError';
    this.message = message || 'Not found';
};
exports.NotFoundError.prototype = new exports.UserError;

/**
 * An error caused by the server
 */
exports.ServerError = function(message, publicMessage) {
    this.name = 'ServerError';
    this.message = message || 'Internal Error';
    this.publicMessage = publicMessage;
};
exports.ServerError.prototype = new Error;

exports.stringify = function(error) {
    return error instanceof Error ? error.stack : String(error);
};
