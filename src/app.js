require('newrelic')
require('sugar')

var CachedUserItems = require('./GooglePlus/CachedUserItems'),
    express = require('express'),
    errors = require('./errors'),
    connect = require('connect'),
    Post = require('./Post'),
    GooglePlus = require('./GooglePlus')

var app = express()
var googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY)
var cachedUserItems = new CachedUserItems(googlePlus)

app.configure(function() {     
    app.use(express.static(__dirname + '/../public'))
    app.set('views', __dirname + '/../views')
    app.set('view engine', 'ejs')   
    app.set('view options', {layout: false})
    app.use(connect.compress());
    app.use(function(request, response, next) {
        response.header('Cache-Control', 'max-age=0')
        next()
    })
})

app.get('/', function(request, response) {
    response.render('home')
})

app.get('/:id', function(request, response, next) {
    var userId = request.params.id
    if (! /^[0-9]+$/.test(userId)) return next()
    var style = {
        title: request.query.title,
        includeAttachmentType: 'include-attachment-type' in request.query
    }
    cachedUserItems.get(userId, function(error, items) {
        if (error) return next(error)
        var posts = items.map(function(item) { return new Post(item, style) })
        response.header('Content-Type', 'text/xml; charset=utf-8')
        response.render('feed', {
            profileUrl: 'https://plus.google.com/' + userId,
            posts: posts
        })
    })
})

app.get('/feed.xsl', function(request, response) {
    response.render('feed-xsl')
})

app.get('/*', function(request, response, next) {
    next(new errors.NotFoundError)
})

app.use(function(error, request, response, next) {
    response.header('Content-Type', 'text/plain; charset=utf-8')
    if (error instanceof errors.UserError) {
        var code = error instanceof errors.NotFoundError ? 404 : 400
        response.send(error.message, code)
    } else {
        console.error(errors.stringify(error))
        response.send(error.publicMessage || "Internal Error", 500)
    }
})

app.listen(process.env.PORT || 8080)
