var fs = require('fs'),
    ejs = require('ejs'),
    jsdom = require('jsdom'),
    async = require('async'),
    request = require('request'),
    querystring = require('querystring')

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
    async.parallel(
        {
            apiPosts: function(callback) {
                postsFromApi(userId, callback)
            },
            uiPosts: function(callback) {
                postsFromUi(userId, callback)
            }
        }, function(error, results) {
            // There are less posts in UI so we use API posts justs to fill the
            // missing fields
            var posts = results.uiPosts
            Object.each(results.apiPosts, function(url, post) {
                if (posts[url]) {
                    posts[url] = Object.merge(posts[url], post)
                }
            })
            callback(null, posts)
        }
    )
}

/**
 * Original JSON is not fully compliant
 */
var fixJson = function(json) {
    json = json.slice(4) // Remove initial ')]}''
    json = json.replace(/,,/mg, ',null,')
    json = json.replace(/,,/mg, ',null,')
    json = json.replace(/\[,/mg, '[null,')
    json = json.replace(/,\]/mg, ',null]')
    return json
}

var postsFromApi = function(userId, callback) {
    userPostsJson(userId, function(error, json) {
        if (error) return callback(error)
        var posts = {}
        json[1][0].each(function(post) {
            var url = 'https://plus.google.com/' + post[21]
            posts[url] = {lastModification: new Date(post[5])}
        })
        callback(null, posts)
    })
}

var userPostsJson = function(userId, callback) {
    request({url: userFeedUrl(userId)}, function(error, response, body) {
        if (error) return callback(error)
        body = fixJson(body)
        try {
            callback(null, JSON.parse(body))
        } catch (error) {
            callback(new Error("Could not parse JSON response: " + error))
        }
    })
}

var userFeedUrl = function(userId) {
    return 'https://plus.google.com/_/stream/getactivities/?' + querystring.stringify({
        sp: JSON.stringify([1, 2, userId, null, null, null, null, 'social.google.com', []]) 
    })
}

var postsFromUi = function(userId, callback) {
    jsdom.env({
        html: 'https://plus.google.com/' + userId + '/posts?hl=en', 
        done: function(errors, window) {
            if (errors) console.log(errors)
            var posts = {}
            var postElements = window.document.getElementsByClassName('Ve')
            for (var i = 0; i < postElements.length; i++) {
                var post = postElements[i]
                var url = 'https://plus.google.com/' + post.getElementsByClassName('c-G-j')[0].href
                var plainBody = htmlToText(post.getElementsByClassName('Us')[0])
                posts[url] = {title: plainBody.trim().split('\n')[0]}
            }
            callback(null, posts)
        }
    })
}
