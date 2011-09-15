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
    response.send(error.message, 500)
}

app.get('/', function(request, response) {
    response.render('home')
})

app.get('/users/:id/feed', function(request, response) {
    googlePlus.userFeed(request.params.id, function(error, feed) {
        if (error) return sendError(response, error)
        response.contentType('text/xml')
        response.send(feed)
    })
})

// For debugging
app.get('/users/:id/json', function(request, response) {
    googlePlus.userJson(request.params.id, function(error, json) {
        if (error) return sendError(response, error)
        response.contentType('application/json')
        response.send(json)
    })
})

app.error(function(error, request, response, next) {
    sendError(response, error)
})

app.listen(process.env.PORT || 8080)
