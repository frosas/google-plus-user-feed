'use strict'

var CachedUserItems = require('../../src/GooglePlus/CachedUserItems')
var assert = require('assert')

describe("CachedUserItems", function () {
    describe("_getCacheAgePerUser", function () {
        it("is 24h with requests at the limit", function () {
            var googlePlus = {} // TODO Don't stub
            var cachedUserItems = new CachedUserItems(googlePlus) // TODO Avoid this dependency
            var age = cachedUserItems._getCacheAgePerUser({
                dailyRequests: 100,
                dailyRequestsLimit: 100
            })
            assert.equal(age, 24 /* hours */ * 60 * 60 * 1000)
        })
    })
})
