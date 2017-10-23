"use strict";

/**
 * New Relic agent configuration.
 *
 * See http://docs.newrelic.com/docs/nodejs/customizing-your-nodejs-config-file
 */
exports.config = {
  app_name: ["Google+ User Feed"],
  capture_params: true,
  logging: { level: "info" },
  ignore_status_codes: [
    400,
    401,
    402,
    403,
    404,
    405,
    406,
    407,
    408,
    409,
    410,
    411,
    412,
    413,
    414,
    415,
    416,
    417
  ]
};
