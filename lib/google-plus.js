var querystring = require('querystring'),
    request = require('request'),
    fs = require('fs'),
    ejs = require('ejs')

exports.userFeed = function(userId, callback) {
    userFeedPosts(userId, function(error, posts) {
        if (error) return callback(error)

        // Get the author name from the first post
        var author = posts.length ? posts[0].author : "Author not available"

        fs.readFile(__dirname + '/../views/feed.ejs', 'utf8', function(error, template) {
            if (error) return callback(error)

            var feed = ejs.render(template, {
                locals: {
                    author: author,
                    profileUrl: 'https://plus.google.com/' + userId,
                    posts: posts
                }
            })

            callback(null, feed)
        })
    })
}

exports.userJson = function(userId, callback) {
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

/**
 * Posts with interesting fields as returned by G+
 */
var userPlusPosts = function(userId, callback) {
    exports.userJson(userId, function(error, json) {
        if (error) return callback(error)
        var posts = json[1][0].map(function(post) {
            return {
                author: post[3],
                htmlBody: post[4],
                lastModification: new Date(post[5]),
                plainBody: post[20],
                url: 'https://plus.google.com/' + post[21]
            }
        })
        callback(null, posts)
    })
}

/**
 * Posts with fields mapped to Atom feed format
 */
var userFeedPosts = function(userId, callback) {
    userPlusPosts(userId, function(error, posts) {
        if (error) return callback(error)
        posts = posts.map(function(post) {
            post.title = post.plainBody.split(/\n\n/)[0]
            return post
        })
        callback(null, posts)
    })
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
