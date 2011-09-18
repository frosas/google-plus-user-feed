var fs = require('fs'),
    ejs = require('ejs'),
    request = require('request'),
    querystring = require('querystring'),
    jsdom = require('jsdom')

exports.Client = function(apiKey) {
    return {
        userPosts: function(userId, callback) {
            var url = 'https://www.googleapis.com/plus/v1/people/' + userId + '/activities/public?' + querystring.stringify({key: apiKey})
            request(url, function(error, response, body) {
                if (error) return callback(error)
                try {
                    var json = JSON.parse(body)
                } catch (error) {
                    return callback(error)
                }
                if (json.error) return callback(new Error(json.error.message))
                var posts = []
                if (json.items) {
                    json.items.each(function(item) {
                        posts.push({
                            url: item.url,
                            title: postTitle(item),
                            updated: new Date(item.updated),
                            author: item.actor.displayName
                        })
                    })
                }
                callback(null, posts)
            })
        }
    }
}

var cut = function(string, length) {
    if (string.length > length) {
        string = string.slice(0, length - 2) + '…'
    }
    return string
}

var htmlToPlain = function(html) {
    var document = jsdom.jsdom('<html>' + html + '</html>')

    // Add line breaks for block elements
    ;['br', 'div', 'p'].forEach(function(tag) {
        var elements = document.getElementsByTagName(tag)
        for (var i = 0; i < elements.length; i++) {
            var newline = document.createTextNode('\n')
            elements[i].parentNode.insertBefore(newline, elements[i])
        }
    })

    return document.documentElement.textContent
}

var postTitle = function(item) {
    var title = (item.verb == 'share' && item.annotation) ?
        htmlToPlain(item.annotation) : // Prefer user annotation on shared items
        htmlToPlain(item.object.content)

    // If there is no title try to get it from attachments
    if (! title && item.object.attachments) {
        for (var i = 0; i < item.object.attachments.length; i++) {
            var title = item.object.attachments[i].displayName
            if (title) break
        }
    }

    if (! title) title = '' // Avoid undefineds

    title = cut(title, 100)

    // Include attachment type
    if (item.object.attachments) {
        var type = (function() {
            if (item.object.attachments.some(function(a) { return a.objectType === 'article' })) return 'link'
            if (item.object.attachments.any(function(a) { return a.objectType === 'photo' })) return 'photo'
            if (item.object.attachments.any(function(a) { return a.objectType === 'video' })) return 'video'
        })()
        if (type) title += ' [' + type + ']'
    }

    return title
}
