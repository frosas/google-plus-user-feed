/**
 * New Relic agent configuration
 *
 * See http://docs.newrelic.com/docs/nodejs/customizing-your-nodejs-config-file
 */
 
'use strict';

const os = require('os');

exports.config = {
    app_name: ['Google+ User Feed'],
    capture_params: true,
    logging: {level: 'info', filepath: `${os.tmpdir()}/newrelic_agent.log`},
    ignore_status_codes: Array.from({length: 99}, (n, i) => 400 + i)
};
