'use strict';

require('../init');

const awsServerlessExpress = require('aws-serverless-express');
const appBuilder = require('../express-app-builder');

const whenServer = appBuilder.build().then(app => awsServerlessExpress.createServer(app));

exports.handler = (event, context) => {
    whenServer.then(server => awsServerlessExpress.proxy(server, event, context));
};
