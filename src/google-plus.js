var request = require('request'),
    querystring = require('querystring'),
    errors = require('./errors'),
    Item = require('./google-plus/Item')

exports.GooglePlus = function(apiKey) {
    return {
        userPosts: function(userId, style, callback) {
            var url = 'https://www.googleapis.com/plus/v1/people/' + userId + '/activities/public?' + querystring.stringify({key: apiKey})
            request(url, function(error, response, body) {
                if (error) return callback(error)
                try {
                    var json = JSON.parse(body)
                } catch (error) {
                    return callback(error)
                }
                if (json.error) {
                    var errorType = function() {
                        if (json.error.code >= 500) return errors.ServerError
                        if (json.error.code == 404) return errors.NotFoundError
                        if (json.error.code >= 400) return errors.UserError
                        return Error
                    }()
                    return callback(new errorType("[Google+ error] " + json.error.message))
                }
                callback(null, (json.items || []).map(function(item) {
                    return new Item(item, style)
                }))
            })
        }
    }
}
