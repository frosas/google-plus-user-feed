/**
 * An error caused by the user of the function
 */
exports.UserError = function(message) {
    this.name = 'UserError'
    this.message = message || 'User error'
}
exports.UserError.prototype = new Error

/**
 * A generic "Not found" error
 */
exports.NotFoundError = function(message) {
    this.name = 'NotFoundError'
    this.message = message || 'Not found'
}
exports.NotFoundError.prototype = new exports.UserError
