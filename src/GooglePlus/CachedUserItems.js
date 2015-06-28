'use strict';

var Q = require('q');
var newrelic = require('newrelic');
var sqlite = require('sqlite3');

var Items = module.exports = function(params) {
    this._googlePlus = params.googlePlus;
    this._db = new sqlite.Database(params.path);
    this._db.run('create table cachedUserItems (id varchar(255), items text, date integer)');
};

Items.prototype.get = function(userId) {
    var items = this;
    userId = userId.toLowerCase(); // Normalize it    
    return this._getCached(userId).then(function (cache) {
        items._logUserCacheStatus(userId, cache);
        if (cache && !cache.expired) return cache.items;
        return items._googlePlus.getUserItems(userId).
            then(function (userItems) {
                return items._setCached(userId, userItems).then(function () {
                    return userItems;
                });
            }).
            catch(function (error) {
                // Try to use the cached items (even if it has expired) before failing
                if (!cache) throw error;
                console.error(error);
                return cache.items;                
            });
    });
};

Items.prototype._setCached = function(userId, items) {
    return Q.nsend(this._db, 'run', 'insert into cachedUserItems values ($id, $items, $date)', {
        $id: userId, 
        $items: JSON.stringify(items),
        $date: Date.now()
    });
};

/**
 * @returns {Object|null} As {items: Array, expired: boolean}
 */
Items.prototype._getCached = function(userId) {    
    var items = this;
    return Q.nsend(this._db, 'get', 'select * from cachedUserItems where id = $id', userId).then(function (cache) {
        return cache && {
            items: JSON.parse(cache.items),
            expired: cache.date < items._getExpirationDate()
        };
    });
};

Items.prototype._logUserCacheStatus = function (userId, cache) {
    var status = {ID: userId, Status: this._getCacheStatus(cache)};
    console.log(JSON.stringify(status));
    newrelic.recordCustomEvent('User Feed Cache', status);
};

Items.prototype._getCacheStatus = function (cache) {
    if (!cache) return 'Missing';
    if (cache.expired) return 'Expired';
    return 'Hit';    
};

Items.prototype._getExpirationDate = function() {
    return new Date(Date.now() - this._getCacheAgePerUser());
};

Items.prototype._getCacheAgePerUser = function (params) {
    params = params || {};
    params.dailyRequestsLimit = params.dailyRequestsLimit || 50000;
    params.maxDailyUsers = params.maxDailyUsers || (8000 /* current amount */ * 1.1 /* margin */);
    var dailyRequestsLimitPerUser = params.dailyRequestsLimit / params.maxDailyUsers;
    var age = 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerUser;
    age /= 1.8; // Is it me or Google allows to do more requests than the stated in the quota?    
    return age;
};