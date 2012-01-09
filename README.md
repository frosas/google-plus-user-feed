# Google+ user feed

Get Google+ user posts as an RSS feed (to export it to Twitter, Facebook, ...)

Use it and get more information at **http://plusfeed.frosas.net/**

## Installation details

- A [Google API key](https://developers.google.com/+/api/oauth) has to be set with the GOOGLE_API_KEY environment variable (eg, `$ GOOGLE_API_KEY=xxx node app.js`)
- Default port is 8080. You can also set it with the PORT env var.

## TODO

- Notify me internal errors (use https://github.com/eleith/emailjs)
- Functional testing
  - Home and feed
  - Use http://visionmedia.github.com/mocha/
- Display errors inline (not as an alert)
- Include full content into the RSS item body (to consume it as any other RSS feed)
- Mark visited links
- Also accept user profile URL
- http://plusfeed.frosas.net/110101110100111001011 (error 500, "Backend Error" -> Google error)
- Some characters don't appear correctly (eg, &#39; @ http://plusfeed.frosas.net/102067232456938436649)
- Anything to learn from https://github.com/jtwebman/GooglePlusToRSSFeed ?
- Convert G+ user references to Twitter ones
