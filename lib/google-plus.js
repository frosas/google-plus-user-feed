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
                    var errorType = function() {
                        if (json.error.code == 404) return errors.NotFoundError
                        if (json.error.code >= 400) return errors.UserError
                        return errors.ServerError
                    }()
                    return callback(new errorType("[Google+ error] " + json.error.message))
                }
                var posts = []
                if (json.items) {
                    json.items.each(function(item) {
                        posts.push({
                            url: item.url,
                            title: postTitle(item),
                            body: formatBody(item),
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

var formatBody = function(item) {

    if (item.object.attachments) {
        var type = (function() {
            if (item.object.attachments.some(function(a) { return a.objectType === 'article' })) return 'link'
            if (item.object.attachments.any(function(a) { return a.objectType === 'photo' })) return 'photo'
            if (item.object.attachments.any(function(a) { return a.objectType === 'video' })) return 'video'
        })()
        if (type) var type = ' [' + type + ']'
    }

    return htmlToPlain(item.object.content)
}

var firstSentence = function(string) {
    if (! string) return string;
    // split sentences, from http://stackoverflow.com/a/11127276/74919
    var re = /[^\r\n.!?]+(:?(:?\r\n|[\r\n]|[.!?])+|$)/gi;
    var first = string.match(re)[0];
    if (first) {
        return first;
    } else {
        return string;
    }

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

    var title = firstSentence(userAnnotation())

    if (! title) titleFromAttachments();

    // When item is an album photo G+ uses the album title as the content, but
    // we'll prefer photo's own annotation
    if (! title && ! belongsToPhotoAlbum()) title = content() 

    if (! title && belongsToPhotoAlbum()) title = content()

    if (! title) title = '' // Avoid undefineds

    return firstSentence(title);
}
