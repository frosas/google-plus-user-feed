'use strict';

// var newrelic = require('newrelic');
var sqlite = require('sqlite3');
const promisify = require('potpourri/dist/es5').promisify;

/**
 * @return {Promise<Items>}
 */
var Items = module.exports = function(params) {
    this._googlePlus = params.googlePlus;
    return promisify(cb => this._db = new sqlite.Database(params.path, cb))().
        then(() => this._createTableIfMissing()).
        then(() => this);
};

Items.prototype._createTableIfMissing = function () {
    return tableExists(this._db, 'cachedUserItems').then(exists => {
        if (exists) return;
        const query = 'create table cachedUserItems (id varchar(255), items text, date integer)';
        return promisify(this._db, 'run')(query).then(() => {
            return promisify(this._db, 'run')('create index id on cachedUserItems (id)');
        });
    });
};

Items.prototype.get = function(userId) {
    userId = userId.toLowerCase(); // Normalize it
    return this._getCached(userId).then(cache => {
        this._logUserCacheStatus(userId, cache);
        
        // If items are cached and fresh, use them.
        if (cache && !cache.expired) return cache.items;
        
        return this._googlePlus.getUserItems(userId).
            then(userItems => this._setCached(userId, userItems).then(() => userItems)).
            catch(error => {
                if (cache) {
                    // Use the cached items (even if they have expired) instead of
                    // failing
                    console.error(error);
                    return cache.items;
                }
                throw error;
            });
    });
};

Items.prototype._setCached = function(userId, cacheItems) {
    const date = Date.now();
    const query = 'insert into cachedUserItems values ($id, $items, $date)';
    const params = {$id: userId, $items: JSON.stringify(cacheItems), $date: date};
    return promisify(this._db, 'run')(query, params).then(() => {
        // Now is a good moment to delete the previous version. Note we don't have
        // to wait for this query to finish.
        let query = 'delete from cachedUserItems where id = $id and date != $date';
        promisify(this._db, 'run')(query, {$id: userId, $date: date}).
            catch(error => console.log(`[WARN] Couldn't delete expired cache: ${error.stack}`));
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
    console.log(JSON.stringify(status));
    // newrelic.recordCustomEvent('User Feed Cache', status);
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
    params.maxDailyUsers = params.maxDailyUsers || 9000; // Current amount
    var dailyRequestsLimitPerUser = params.dailyRequestsLimit / params.maxDailyUsers;
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerUser;
};

// From http://stackoverflow.com/questions/1601151/how-do-i-check-in-sqlite-whether-a-table-exists
const tableExists = (db, table) => {
    const query = "select name from sqlite_master where type = 'table' and name = ?";
    return promisify(db, 'get')(query, table);
};
