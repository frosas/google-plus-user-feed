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

    Object.defineProperty(this, 'expirationDate', {
        get: function() { return new Date(Date.now() - cacheAgePerUser) }
    })
}

Items.prototype.get = function(userId, callback) {
    var items = this
    var userItems = this._getCached(userId)
    if (userItems) return callback(null, userItems)
    this._googlePlus.userItems(userId, function(e, userItems) {
        if (e) return callback(e)
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

Items.prototype._getCached = function(userId) {
    var userItems = this._itemsByUser[userId]

    if (!userItems) {
        console.log('[CACHE] Missing for ' + userId)
        return
    }

    if (userItems.date < this.expirationDate) {
        console.log('[CACHE] Expired for ' + userId + ' (' + userItems.date + ')')
        return
    }

    console.log('[CACHE] Hit for ' + userId)
    return userItems.items
}

module.exports = Items
