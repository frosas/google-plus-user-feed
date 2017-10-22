'use strict';

var newrelic = require('newrelic');

const GOOGLE_PLUS_DAILY_REQUESTS_LIMIT = 50000;

/**
 * The amount of distinct feeds expected to be requested every day.
 * 
 * An approximation can be obtained by calculating the amount of feeds that were
 * cached in the last 24 hours:
 * 
 *   select distinct count(id) from cachedUserItems where date > strftime('%s', 'now', '-1 day') * 1000;
 */
const EXPECTED_DAILY_UNIQUE_REQUESTED_FEEDS = 18502;

var Items = module.exports = function({googlePlus, repository}) {
    this._googlePlus = googlePlus;
    this._repository = repository;
};

Items.prototype.get = function(userId) {
    userId = userId.toLowerCase(); // Normalize it
    return this._repository.get(userId).then(cache => {
        cache = cache && Object.assign({}, cache, {
            expired: cache.date < this._getExpirationDate()
        });
        this._logUserCacheStatus(userId, cache);
        if (cache && !cache.expired) return cache.items;
        return this._googlePlus.getUserItems(userId).
            then(userItems => this._repository.set(userId, userItems).then(() => userItems)).
            catch(error => {
                // Try to use the cached items (even if it has expired) before failing
                if (!cache) throw error;
                // eslint-disable-next-line no-console
                console.error(error);
                return cache.items;
            });
    });
};

Items.prototype._logUserCacheStatus = function (userId, cache) {
    var status = {ID: userId, Status: this._getCacheStatus(cache)};
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(status));
    newrelic.recordCustomEvent('User Feed Cache', status);
};

Items.prototype._getCacheStatus = function (cache) {
    if (!cache) return 'Missing';
    if (cache.expired) return 'Expired';
    return 'Hit';
};

Items.prototype._getExpirationDate = function() {
    return new Date(Date.now() - this._getFeedCacheAge());
};

Items.prototype._getFeedCacheAge = function ({dailyRequestsLimit, maxDailyFeeds} = {}) {
    dailyRequestsLimit = dailyRequestsLimit || GOOGLE_PLUS_DAILY_REQUESTS_LIMIT;
    maxDailyFeeds = maxDailyFeeds || EXPECTED_DAILY_UNIQUE_REQUESTED_FEEDS;
    const dailyRequestsLimitPerFeed = dailyRequestsLimit / maxDailyFeeds;
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerFeed;
};
