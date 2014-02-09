'use strict'

var GooglePlus = require('../GooglePlus')
var Post = require('../Post')

/**
 * @returns {number} In seconds
 */
var getLapseSinceLastUpdate = function(posts) {
    return posts.length ? Math.round((new Date - posts[0].updated) / 1000) : Infinity
}

var getMaxAge = function(posts) {
    var minAge = 40 /* mins */ * 60
    var maxAge = 3 /* hours */ * 60 * 60
    return Math.max(minAge, Math.min(maxAge, getLapseSinceLastUpdate(posts)))
}

var getExpirationDate = function(posts) {
    return new Date(Date.now() - getMaxAge(posts) * 1000)
}

var Items = function(apiKey) {
    this._plus = new GooglePlus(apiKey)
    this._itemsByUser = []
}

Items.prototype.get = function(userId, callback) {
    var items = this
    var userItems = this._getCached(userId)
    if (userItems) return callback(null, userItems)
    this._plus.userItems(userId, function(e, userItems) {
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
    if (!userItems) return
    var items = userItems.items
    var posts = items.map(function(item) { return new Post(item) })
    if (userItems.date < getExpirationDate(posts)) return
    return items
}

module.exports = Items
