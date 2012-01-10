var request = require('request'),
    querystring = require('querystring'),
    jsdom = require('jsdom'),
    errors = require('./errors')

exports.GooglePlus = function(apiKey) {
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
                if (json.error) {
                    var type = function() {
                        if (json.error.code == 404) return errors.NotFoundError
                        return Error
                    }()
                    var error = new type(json.error.message)
                    return callback(error)
                }
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

    var belongsToPhotoAlbum = function() {
        return item.object.attachments &&
            item.object.attachments.any(function(a) { 
                return a.objectType === 'photo-album' 
            })
    }

    var userAnnotation = function() {
        if (item.verb === 'share' && item.annotation) {
            return htmlToPlain(item.annotation)
        }
    }

    var titleFromAttachments = function() {
        if (item.object.attachments) {
            for (var i = 0; i < item.object.attachments.length; i++) {
                title = item.object.attachments[i].displayName
                if (title) return title
            }
        }
    }

    var content = function() {
        return htmlToPlain(item.object.content)
    }

    var title = userAnnotation()

    // When item is an album photo G+ uses the album title as the content, but 
    // we'll prefer photo's own annotation
    if (! title && ! belongsToPhotoAlbum()) title = content() 

    if (! title) title = titleFromAttachments()

    if (! title && belongsToPhotoAlbum()) title = content()

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
