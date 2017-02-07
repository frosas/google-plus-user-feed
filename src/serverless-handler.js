'use strict';

exports.test = (event, context, callback) => {
    callback(null, {
        statusCode: 200,
        body: JSON.stringify({event, context})
    });
};
