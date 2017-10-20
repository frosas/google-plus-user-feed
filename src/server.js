'use strict';

require('newrelic');

const App = require('./App');
const GooglePlus = require('./GooglePlus');
const CachedUserItems = require('./GooglePlus/CachedUserItems');
const CachedFeedsRepository = require('./cached-feeds-repository');

process.on('unhandledRejection', error => { throw error; });

CachedFeedsRepository.create('persistent/main.db').then(repository => {
    const feeds = new CachedUserItems({
        googlePlus: new GooglePlus(process.env.GOOGLE_API_KEY),
        repository
    });
    new App(feeds).listen(process.env.PORT || 8080);
});