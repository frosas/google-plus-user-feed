var fs = require('fs'),
    ejs = require('ejs'),
    jsdom = require('jsdom')

var htmlToText = function(html) {
    // Add line breaks for block elements
    ['br', 'div', 'p'].forEach(function(tag) {
        var elements = html.getElementsByTagName(tag)
        for (var i = 0; i < elements.length; i++) {
            var newline = html.ownerDocument.createTextNode('\n')
            elements[i].parentNode.insertBefore(newline, elements[i])
        }
    })

    // Remove the "* originally shared this post:" element
    var elements = html.getElementsByClassName('Ux')
    for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i])
    }

    return html.textContent
}

var userPosts = function(userId, callback) {
    jsdom.env({
        html: 'https://plus.google.com/' + userId + '/posts', 
        done: function(errors, window) {
            if (errors) console.log(errors)
            var posts = []
            var postElements = window.document.getElementsByClassName('Ve')
            for (var i = 0; i < postElements.length; i++) {
                var post = postElements[i]
                var body = post.getElementsByClassName('Us')[0]
                posts.push({
                    url: 'https://plus.google.com/' + post.getElementsByClassName('c-G-j')[0].href,
                    title: htmlToText(body).trim().split('\n')[0],
                    lastModification: new Date
                })
            }
            callback(null, posts)
        }
    })
}

exports.userFeed = function(userId, callback) {
    userPosts(userId, function(error, posts) {
        if (error) return callback(error)

        fs.readFile(__dirname + '/../views/feed.ejs', 'utf8', function(error, template) {
            if (error) return callback(error)

            var feed = ejs.render(template, {
                locals: {
                    profileUrl: 'https://plus.google.com/' + userId,
                    posts: posts
                }
            })

            callback(null, feed)
        })
    })
}
