'use strict';

require('newrelic');

const App = require('./App');
const GooglePlus = require('./GooglePlus');
const CachedFeeds = require('./CachedFeeds');
const CachedFeedsRepository = require('./cachedFeeds/Repository');

process.on('unhandledRejection', error => { throw error; });

CachedFeedsRepository.create('persistent/main.db').then(repository => {
    const googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);
    const feeds = new CachedFeeds({googlePlus, repository});
    new App(feeds).listen(process.env.PORT || 8080);
});