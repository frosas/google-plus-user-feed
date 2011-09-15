var fs = require('fs'),
    ejs = require('ejs'),
    request = require('request'),
    querystring = require('querystring')

exports.Client = function(apiKey) {
    var userPosts = function(userId, callback) {
        var url = 'https://www.googleapis.com/plus/v1/people/' + userId + '/activities/public?' + querystring.stringify({key: apiKey})
        request(url, function(error, response, body) {
            if (error) return callback(error)
            try {
                var json = JSON.parse(body)
                if (json.error) throw new Error(json.error.message)
                var posts = []
                if (json.items) {
                    json.items.each(function(item) {
                        posts.push({
                            url: item.url,
                            title: postTitle(item),
                            updated: new Date(item.updated)
                        })
                    })
                }
                callback(null, posts)
            } catch (error) {
                callback(error)
            }
        })
    }

    return {
        userFeed: function(userId, callback) {
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
    }
}

var postTitle = function(item) {
    var title = item.title // Already cutted to 100 chars

    // If there is no title try to get it from attachments
    if (! title && item.object.attachments) {
        for (var i = 0; i < item.object.attachments.length; i++) {
            var title = item.object.attachments[i].displayName
            if (title) break
        }
    }

    // Attachment type
    var attachment = ''
    if (item.object.attachments) {
        var type = (function() {
            if (item.object.attachments.some(function(a) { return a.objectType === 'article' })) return 'link'
            if (item.object.attachments.any(function(a) { return a.objectType === 'photo' })) return 'photo'
            if (item.object.attachments.any(function(a) { return a.objectType === 'video' })) return 'video'
        })()
        if (type) attachment = '[' + type + ']'
    }

    var finalTitle = []
    if (title) finalTitle.push(title)
    if (attachment) finalTitle.push(attachment)
    return finalTitle.join(' ')
}
