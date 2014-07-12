'use strict'

var Post = require('../Post')
var _ = require('lodash')
var Q = require('q')

var Items = function(googlePlus) {
    this._googlePlus = googlePlus
    this._itemsByUser = {}
}

Items.prototype.get = function(userId) {
    var items = this
    userId = userId.toLowerCase() // Normalize it
    var cache = this._getCached(userId)
    console.log(this._getUserCacheLog(userId, cache))
    if (cache && !cache.expired) return Q(cache.value)
    return this._googlePlus.getUserItems(userId)
        .then(function (userItems) {
            items._setCached(userId, userItems)
            return userItems
        })    
        .catch(function (error) {
            // Try to use the cached value (even if it has expired) before failing
            if (!cache) throw error
            console.error(error)
            return cache.value
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
    params.maxDailyUsers = params.maxDailyUsers || 10000 /* current amount */ * 1.1 /* margin */
    params.dailyRequestsLimit = params.dailyRequestsLimit || 50000
    var dailyRequestsLimitPerUser = params.dailyRequestsLimit / params.maxDailyUsers
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerUser
}

module.exports = Items
