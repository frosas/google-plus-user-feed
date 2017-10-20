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

    get database() {
        return this._database;
    }
};