'use strict';

require('newrelic');

const App = require('./App');
const GooglePlus = require('./GooglePlus');
const CachedUserItems = require('./GooglePlus/CachedUserItems');
const sqlite = require('sqlite3');
const promisify = require('potpourri/dist/es5').promisify;

process.on('unhandledRejection', error => { throw error; });

const googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);

const openDatabase = path => {
    let database;
    return promisify(callback => database = new sqlite.Database(path, callback))()
        .then(() => database);
};

// From http://stackoverflow.com/questions/1601151/how-do-i-check-in-sqlite-whether-a-table-exists
const tableExists = (db, table) => {
    const query = "select name from sqlite_master where type = 'table' and name = ?";
    return promisify(db, 'get')(query, table);
};

const createTableIfMissing = db => {
    return tableExists(db, 'cachedUserItems').then(exists => {
        if (exists) return;
        const query = 'create table cachedUserItems (id varchar(255), items text, date integer)';
        return promisify(db, 'run')(query).then(() => {
            return promisify(db, 'run')('create index id on cachedUserItems (id)');
        });
    });
};

openDatabase('persistent/main.db').then(database => {
    return createTableIfMissing(database).then(() => {
        const cachedFeeds = new CachedUserItems({googlePlus, database});
        new App(cachedFeeds).listen(process.env.PORT || 8080);
    });
});