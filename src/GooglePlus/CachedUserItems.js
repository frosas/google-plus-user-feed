'use strict'

var Post = require('../Post')
var _ = require('lodash')

var Items = function(googlePlus) {
    this._googlePlus = googlePlus
    this._itemsByUser = {}
}

Items.prototype.get = function(userId, callback) {
    var items = this
    userId = userId.toLowerCase() // Normalize it
    var cache = this._getCached(userId)
    console.log(this._getUserCacheLog(userId, cache))
    if (cache && !cache.expired) return callback(null, cache.value)
    this._googlePlus.userItems(userId, function(err, userItems) {
        if (err) {
            // Try to use the cached value (even if it expired) or simply fail
            if (!cache) return callback(err)
            console.error(err)
            return callback(null, cache.value)
        }
        items._setCached(userId, userItems)
        callback(null, userItems)
    })
}

Items.prototype._setCached = function(userId, items) {
    this._itemsByUser[userId] = {
        items: items,
        date: new Date
    }
}

/**
 * @returns {Object|null} As {value, expired: boolean}
 */
Items.prototype._getCached = function(userId) {
    var cache = this._itemsByUser[userId]
    if (cache) {
        return {
            value: cache.items,
            expired: cache.date < this._getExpirationDate()
        }
    }
}

Items.prototype._getUserCacheLog = function (userId, cache) {
    return JSON.stringify({
        user: userId,
        cache: (function () {
            if (!cache) return 'missing'
            if (cache.expired) return 'expired'
            return 'hit'
        })()
    })
}

Items.prototype._getExpirationDate = function() {
    return new Date(Date.now() - this._getCacheAgePerUser())
}

Items.prototype._getCacheAgePerUser = function (params) {
    params = params || {}
    params.dailyRequests = params.dailyRequests || 5000
    params.dailyRequestsLimit = params.dailyRequestsLimit || 50000
    var dailyUserRequestsLimit = params.dailyRequestsLimit / params.dailyRequests
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyUserRequestsLimit
}

module.exports = Items
