'use strict';

// require('newrelic');

process.on('unhandledRejection', error => { throw error; });
