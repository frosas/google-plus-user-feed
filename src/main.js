'use strict';

var App = require('./App');
var GooglePlus = require('./GooglePlus');
var CachedUserItems = require('./GooglePlus/CachedUserItems');

var googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);
var cachedUserItems = new CachedUserItems(googlePlus);

new App(cachedUserItems).listen(process.env.PORT || 8080);
