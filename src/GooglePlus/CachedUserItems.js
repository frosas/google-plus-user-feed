'use strict';

var newrelic = require('newrelic');
const promisify = require('potpourri/dist/es5').promisify;

var Items = module.exports = function({googlePlus, repository}) {
    this._googlePlus = googlePlus;
    this._repository = repository;
    this._db = repository.database;
};

Items.prototype.get = function(userId) {
    userId = userId.toLowerCase(); // Normalize it
    return this._getCached(userId).then(cache => {
        this._logUserCacheStatus(userId, cache);
        
        // If items are cached and fresh, use them.
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

/**
 * @returns {Object|null} As {items: Array, expired: boolean}
 */
Items.prototype._getCached = function(userId) {
    const query = 'select * from cachedUserItems where id = $id order by date desc';
    return promisify(this._db, 'get')(query, userId).then(cache => {
        return cache && {
            items: JSON.parse(cache.items),
            expired: cache.date < this._getExpirationDate()
        };
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

Items.prototype._getFeedCacheAge = function (params) {
    params = params || {};
    params.dailyRequestsLimit = params.dailyRequestsLimit || 50000;
    params.maxDailyFeeds = params.maxDailyFeeds || 10857 + 7894; // Current amount
    var dailyRequestsLimitPerUser = params.dailyRequestsLimit / params.maxDailyFeeds;
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerUser;
};
