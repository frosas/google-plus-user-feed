require('sugar')

var googlePlus = require('./google-plus'),
    express = require('express'),
    errors = require('./errors'),
    connect = require('connect')

var app = express()

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
    var plus = new googlePlus.GooglePlus(process.env.GOOGLE_API_KEY)
    var styles = {
        title: request.query.title || 'cut'
    }

    /**
     * @returns {number} In seconds
     */
    var getLapseSinceLastUpdate = function(posts) {
        return posts.length ? Math.round((new Date - posts[0].updated) / 1000) : Infinity
    }

    var getCacheMaxAge = function(posts) {
        var minAge = 20 /* mins */ * 60
        var maxAge = 3 /* hours */ * 60 * 60
        return Math.max(minAge, Math.min(maxAge, getLapseSinceLastUpdate(posts)))
    }

    plus.userPosts(userId, styles, function(error, posts) {
        if (error) return next(error)
        response.header('Content-Type', 'text/xml; charset=utf-8')
        response.header('Cache-Control', 'max-age=' + getCacheMaxAge(posts))
        response.render('feed', {
            profileUrl: 'https://plus.google.com/' + userId,
            posts: posts,
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
        console.error(error.message)
        response.send(error.publicMessage || "Internal Error", 500)
    }
})

app.listen(process.env.PORT || 8080)
