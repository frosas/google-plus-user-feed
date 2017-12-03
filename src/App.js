"use strict";

var express = require("express");
var errors = require("./errors");
var Post = require("./Post");

module.exports = class {
  constructor(feeds) {
    var app = express();
    app.set("views", "views");
    app.set("view engine", "ejs");
    app.set("view options", { layout: false });

    app.get("/", function(request, response) {
      response.render("home");
    });

    // TODO Why named regexps don't work? E.g. /:id([0-9]+|\\+.+)
    app.get(/^\/([0-9]+|\+.+)/, function(request, response, next) {
      var userId = request.params[0];
      var style = {
        title: request.query.title,
        includeAttachmentType: "include-attachment-type" in request.query
      };
      feeds
        .get(userId)
        .then(function(items) {
          const posts = items.map(item => new Post(item, style));
          response.header("Content-Type", "text/xml; charset=utf-8");
          response.render("feed", {
            profileUrl: "https://plus.google.com/" + userId,
            posts: posts
          });
        })
        .catch(next);
    });

    app.get("/feed.xsl", function(request, response) {
      response.render("feed-xsl");
    });

    app.use(express.static("public"));

    app.use(function(request, response, next) {
      next(new errors.NotFoundError());
    });

    app.use((error, request, response, next) => {
      this._logError(error);
      response.header("Content-Type", "text/plain; charset=utf-8");
      response.status(this._getErrorStatus(error));
      response.send(this._getErrorMessage(error));
      next();
    });

    return app;
  }

  _getErrorStatus(error) {
    if (error instanceof errors.NotFoundError) return 404;
    if (error instanceof errors.UserError) return 400;
    return 500;
  }

  _getErrorMessage(error) {
    if (error instanceof errors.NotFoundError) return "Not Found";
    if (error instanceof errors.UserError) return "User Error";
    return "Internal Error";
  }

  _logError(error) {
    if (error instanceof errors.NotFoundError) return;
    // eslint-disable-next-line no-console
    console.error(errors.stringify(error));
  }
};
