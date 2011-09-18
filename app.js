require('sugar')

var googlePlus = require('./lib/google-plus'),
    express = require('express')

var app = express.createServer()

app.configure(function() {     
    app.use(express.static(__dirname + '/public'))
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')   
    app.set('view options', {layout: false})
})

var sendError = function(response, error) {
    console.error(error)
    response.send(error.message, 500)
}

app.get('/', function(request, response) {
    response.render('home')
})

app.get('/:id', function(request, response, next) {
    var userId = request.params.id
    if (! /[0-9]+/.test(userId)) return next()
    var client = new googlePlus.Client(process.env.GOOGLE_API_KEY)
    client.userPosts(userId, function(error, posts) {
        if (error) return sendError(response, error)

        response.contentType('text/xml')
        response.render('feed', {
            profileUrl: 'https://plus.google.com/' + userId,
            posts: posts
        })
    })
})

// Legacy path
app.get('/users/:id/feed', function(request, response) {
    response.redirect('/' + request.params.id, 301)
})

app.error(function(error, request, response, next) {
    sendError(response, error)
})

app.listen(process.env.PORT || 8080)
