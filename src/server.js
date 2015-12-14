'use strict';

require('newrelic');

const App = require('./App');
const GooglePlus = require('./GooglePlus');
const CachedUserItems = require('./GooglePlus/CachedUserItems');
    
process.on('unhandledRejection', error => { throw error; });

const googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);
new CachedUserItems({googlePlus: googlePlus, path: 'persistent/main.db'}).
    then(items => new App(items).listen(process.env.PORT || 8080));
