require('sugar')

var googlePlus = require('./lib/google-plus'),
    express = require('express'),
    errors = require('./lib/errors')

var app = express.createServer()

app.configure(function() {     
    app.use(express.static(__dirname + '/public'))
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')   
    app.set('view options', {layout: false})
})

app.get('/', function(request, response) {
    response.render('home')
})

app.get('/:id', function(request, response, next) {
    var userId = request.params.id
    if (! /^[0-9]+$/.test(userId)) return next()
    var plus = new googlePlus.GooglePlus(process.env.GOOGLE_API_KEY)
    plus.userPosts(userId, function(error, posts) {
        if (error) return next(error)
        response.contentType('text/xml')
        response.render('feed', {
            profileUrl: 'https://plus.google.com/' + userId,
            posts: posts,
        })
    })
})

// Legacy path
app.get('/users/:id/feed', function(request, response) {
    response.redirect('/' + request.params.id, 301)
})

app.get('/feed.xsl', function(request, response) {
    response.render('feed-xsl')
})

app.get('/*', function(request, response, next) {
    next(new errors.NotFoundError)
})

app.error(function(error, request, response, next) {
    response.header('Content-Type', 'text/plain')
    if (error instanceof errors.UserError) {
        var code = error instanceof errors.NotFoundError ? 404 : 400
        response.send(error.message, code)
    } else {
        console.error(error.message)
        response.send(error.publicMessage || "Internal Error", 500)
    }
})

app.listen(process.env.PORT || 8080)
