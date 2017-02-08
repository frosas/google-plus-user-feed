'use strict';

require('../init');

exports.handler = (event, context, callback) => {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({event, context})
    });
};

