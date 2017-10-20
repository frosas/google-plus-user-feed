'use strict';

var CachedFeeds = require('../../src/cached-feeds');
var assert = require('assert');

var assertEqualsToDecimals = function(current, expected, decimals) {
    current = Math.round(current * Math.pow(10, decimals));
    expected = Math.round(expected * Math.pow(10, decimals));
    assert.equal(current, expected);
};

describe("CachedFeeds", function () {
    describe("_getFeedCacheAge", function () {
        it("is ~3.84 hours for current values", function () {
            var age = new CachedFeeds({})._getFeedCacheAge({
                dailyRequestsLimit: 50000,
                maxDailyFeeds: 8000
            });
            assertEqualsToDecimals(age, 3.84 /* hours */ * 60 * 60 * 1000, 2 /* decimals */);
        });

        it("is xxx for a single user", function() {
            var age = new CachedFeeds({})._getFeedCacheAge({
                dailyRequestsLimit: 50000,
                maxDailyFeeds: 1
            });
            assertEqualsToDecimals(age, 1.728 /* secs */ * 1000, 2 /* decimals */);
        });
    });
});