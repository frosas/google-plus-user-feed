'use strict'

var CachedUserItems = require('../../src/GooglePlus/CachedUserItems')
var assert = require('assert')

describe("CachedUserItems", function () {
    describe("_getCacheAgePerUser", function () {
        it("is ~4 hours for current values", function () {
            var googlePlus = {} // TODO Don't stub
            var cachedUserItems = new CachedUserItems(googlePlus) // TODO Avoid this dependency
            var age = cachedUserItems._getCacheAgePerUser({
                maxDailyUsers: 10000,
                dailyRequestsLimit: 50000
            })
            assert.equal(age, 4.8 /* hours */ * 60 * 60 * 1000)
        })
    })
})
