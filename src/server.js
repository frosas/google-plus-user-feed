'use strict';

require('newrelic');

const App = require('./App');
const GooglePlus = require('./GooglePlus');
const CachedUserItems = require('./GooglePlus/CachedUserItems');
const CachedFeedsRepository = require('./cached-feeds-repository');

process.on('unhandledRejection', error => { throw error; });

CachedFeedsRepository.create('persistent/main.db').then(repository => {
    const cachedFeeds = new CachedUserItems({
        googlePlus: new GooglePlus(process.env.GOOGLE_API_KEY),
        database: repository.database
    });
    new App(cachedFeeds).listen(process.env.PORT || 8080);
});