"use strict";

var newrelic = require("newrelic");

const GOOGLE_PLUS_DAILY_REQUESTS_LIMIT = 50000;

/**
 * The amount of distinct feeds expected to be requested every day.
 * 
 * An approximation can be obtained by calculating the amount of unique feeds 
 * requested on the previous day:
 * 
 *   $ cat /var/log/nginx/plusfeed-access.log.1 | awk '{ print $7 }' | sort -u | wc -l
 */
const EXPECTED_DAILY_UNIQUE_REQUESTED_FEEDS = 21164;

module.exports = class Items {
  constructor({ googlePlus, cache }) {
    this._googlePlus = googlePlus;
    this._cache = cache;
  }

  get(userId) {
    userId = userId.toLowerCase(); // Normalize it
    return this._cache.get(userId).then(cache => {
      cache =
        cache &&
        Object.assign({}, cache, {
          expired: cache.date < this._getExpirationDate()
        });
      this._logUserCacheStatus(userId, cache);
      if (cache && !cache.expired) return cache.items;
      return this._googlePlus
        .getUserItems(userId)
        .then(userItems =>
          this._cache.set(userId, userItems).then(() => userItems)
        )
        .catch(error => {
          // Try to use the cached items (even if it has expired) before failing
          if (!cache) throw error;
          // eslint-disable-next-line no-console
          console.error(error);
          return cache.items;
        });
    });
  }

  _logUserCacheStatus(userId, cache) {
    var status = { ID: userId, Status: this._getCacheStatus(cache) };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(status));
    newrelic.recordCustomEvent("User Feed Cache", status);
  }

  _getCacheStatus(cache) {
    if (!cache) return "Missing";
    if (cache.expired) return "Expired";
    return "Hit";
  }

  _getExpirationDate() {
    return new Date(Date.now() - this._getFeedCacheAge());
  }

  _getFeedCacheAge({ dailyRequestsLimit, maxDailyFeeds } = {}) {
    dailyRequestsLimit = dailyRequestsLimit || GOOGLE_PLUS_DAILY_REQUESTS_LIMIT;
    maxDailyFeeds = maxDailyFeeds || EXPECTED_DAILY_UNIQUE_REQUESTED_FEEDS;
    const dailyRequestsLimitPerFeed = dailyRequestsLimit / maxDailyFeeds;
    return 1 /* day */ * 24 * 60 * 60 * 1000 / dailyRequestsLimitPerFeed;
  }
};
