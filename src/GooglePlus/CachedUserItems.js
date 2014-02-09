'use strict'

var GooglePlus = require('../GooglePlus')
var Post = require('../Post')
var _ = require('lodash')

var googlePlusRequestsMonthlyLimit = 
    50000 /* real reqs/month */ * 
    .9 // give some margin to monthly growths
var month = 30 /* days */ * 24 * 60 * 60 * 1000

var Items = function(apiKey) {
    this._plus = new GooglePlus(apiKey)
    this._itemsByUser = {}

    Object.defineProperty(this, 'monthlyUsersCount', {
        get: function() {
            return _.map(this._itemsByUser)
                .filter(function(userItems) {
                    return userItems.date > new Date(Date.now() - 1 * month)
                })
                .length
        }
    })

    Object.defineProperty(this, 'maxRequestsPerUserAndMonth', {
        get: function() { 
            return googlePlusRequestsMonthlyLimit / this.monthlyUsersCount 
        }
    })

    Object.defineProperty(this, 'cacheAgePerUser', {
        get: function() { 
            return 1 * month / this.maxRequestsPerUserAndMonth 
        }
    })

    Object.defineProperty(this, 'expirationDate', {
        get: function() { return new Date(Date.now() - this.cacheAgePerUser) }
    })
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
    if (userItems.date < this.expirationDate) return
    return userItems.items
}

module.exports = Items
