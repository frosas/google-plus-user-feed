'use strict';

const App = require('./App');
const GooglePlus = require('./GooglePlus');
// const CachedUserItems = require('./GooglePlus/CachedUserItems');

exports.build = () => {
    const googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);
    // const cachedUserItems = new CachedUserItems({googlePlus, path: 'persistent/main.db'});
    const cachedUserItems = Promise.resolve({
        get(userId) {
            return googlePlus.getUserItems(userId);
        }
    });
    return cachedUserItems.then(items => new App(items));
};