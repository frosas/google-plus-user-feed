'use strict'

var Post = require('../Post')
var _ = require('lodash')

var dailyRequestsLimit = 50000
var dailyUsersCount = 2700
var dailyUserRequestsLimit = dailyRequestsLimit / dailyUsersCount
var cacheAgePerUser = 1 /* day */ * 24 * 60 * 60 * 1000 / dailyUserRequestsLimit

var Items = function(googlePlus) {
    this._googlePlus = googlePlus
    this._itemsByUser = {}
}

Items.prototype.get = function(userId, callback) {
    var items = this
    var cache = this._getCached(userId)
    console.log('[CACHE] ' + this._getUserCacheStatusMessage(userId, cache))
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

Items.prototype._getUserCacheStatusMessage = function(userId, cache) {
    if (!cache) return 'Missing for ' + userId
    if (cache.expired) return 'Expired for ' + userId
    return 'Hit for ' + userId
}

Items.prototype._getExpirationDate = function() {
    return new Date(Date.now() - cacheAgePerUser)
}

module.exports = Items
