# Google+ user feed

Get Google+ user posts as an RSS feed (to export it to Twitter, Facebook, ...)

Use it and get more information at **http://plusfeed.frosas.net/**

## Installation details

- Get [Node.js](http://nodejs.org/)
- `$ npm install`
- `$ GOOGLE_API_KEY=xxx node app.js` (see [Google API key](https://developers.google.com/+/api/oauth))
- Visit [http://localhost:8080/](http://localhost:8080/)

## MettaCustomizations

- Full-text RSS content using <content:encoded>
- First sentence as title
- Hashtags included at end of title if they are not already in there
- Automatic loading of a default feed if GOOGLE_PROFILE environment variable is present.

## TODO

- Notify me internal errors
  - By mail (https://github.com/eleith/emailjs)
  - By Loggly's Alert Birds
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
- Transformations (make all of them optional?)
    - G+ user references to Twitter ones
    - Include the activity type (link, image, video, ...)
    - Cut title
    - Include hashtags in RSS item content (to filter by them)
    - Use only the first line of activity content as title
- http://plusfeed.frosas.net/113946693980366737813 doesn't show anything
- Checkins appear empty (e.g. http://plusfeed.frosas.net/110318982509514011806)
