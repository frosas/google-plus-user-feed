'use strict';

const sqlite = require('sqlite3');
const promisify = require('potpourri/dist/es5').promisify;

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

module.exports = class Repository {    
    static create(databasePath) {
        return openDatabase(databasePath).then(database => {
            return createTableIfMissing(database)
                .then(() => new Repository(database));
        });
    }
    
    constructor(database) {
        this._database = database;
    }

    set(feedId, items) {
        const date = Date.now();
        const query = 'insert into cachedUserItems values ($id, $items, $date)';
        const params = {$id: feedId, $items: JSON.stringify(items), $date: date};
        return promisify(this._database, 'run')(query, params).then(() => {
            // Now is a good moment to delete the previous version. Note we don't have
            // to wait for this query to finish.
            let query = 'delete from cachedUserItems where id = $id and date != $date';
            promisify(this._database, 'run')(query, {$id: feedId, $date: date})
                // eslint-disable-next-line no-console
                .catch(error => console.log(`[WARN] Couldn't delete expired cache: ${error.stack}`));
        });    
    }
    
    /**
     * @returns {Object|null} As {items: Array, expired: boolean}
     */
    get(userId) {
        const query = 'select * from cachedUserItems where id = $id order by date desc';
        return promisify(this._database, 'get')(query, userId).then(cache => {
            return cache && {items: JSON.parse(cache.items), date: cache.date};
        });
    }
};