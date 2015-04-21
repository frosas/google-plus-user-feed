'use strict';

var express = require('express');
var errors = require('./errors');
var Post = require('./Post');

module.exports = function(cachedUserItems) {
    var app = express();

    app.configure(function() {
        app.use(express.compress());
        app.use(express.static('public'));
        app.set('views', 'views');
        app.set('view engine', 'ejs');
        app.set('view options', {layout: false});
        app.use(function(request, response, next) {
            response.header('Cache-Control', 'max-age=0');
            next();
        });
    });

    app.get('/', function(request, response) {
        response.render('home');
    });

    app.get('/:id', function(request, response, next) {
        var userId = request.params.id;
        if (!/^([0-9]+|\+.*)$/.test(userId)) return next();
        var style = {
            title: request.query.title,
            includeAttachmentType: 'include-attachment-type' in request.query
        };
        cachedUserItems.get(userId)
            .then(function(items) {
                var posts = items.map(function(item) { return new Post(item, style); });
                response.header('Content-Type', 'text/xml; charset=utf-8');
                response.render('feed', {
                    profileUrl: 'https://plus.google.com/' + userId,
                    posts: posts
                });
            })
            .catch(next);
    });

    app.get('/feed.xsl', function(request, response) {
        response.render('feed-xsl');
    });

    app.get('/*', function(request, response, next) {
        next(new errors.NotFoundError);
    });

    app.use(function(error, request, response, next) { // eslint-disable-line no-unused-vars
        response.header('Content-Type', 'text/plain; charset=utf-8');
        if (error instanceof errors.UserError) {
            console.error(error);
            var code = error instanceof errors.NotFoundError ? 404 : 400;
            response.send(error.message, code);
        } else {
            console.error(errors.stringify(error));
            response.send(error.publicMessage || "Internal Error", 500);
        }
    });

    return app;
};
