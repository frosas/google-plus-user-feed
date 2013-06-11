# Google+ user feed

Get Google+ user posts as an RSS feed (to export it to Twitter, Facebook, ...)

Use it and get more information at **http://plusfeed.frosas.net/**

## Changelog

2013-06-12

- Added posts content (thanks to [John Metta](https://github.com/johnmetta))

## Installation details

- Get [Node.js](http://nodejs.org/)
- `$ npm install`
- `$ GOOGLE_API_KEY=xxx node app.js` (see [Google API key](https://developers.google.com/+/api/oauth))
- Visit [http://localhost:8080/](http://localhost:8080/)

## TODO

- Notify me internal errors
  - By mail (https://github.com/eleith/emailjs)
  - By Loggly's Alert Birds
- Functional testing
   - Home and feed
   - Use http://visionmedia.github.com/mocha/
- Display errors inline (not as an alert)
- Mark visited links
- Also accept user profile URL
- Anything to learn from https://github.com/jtwebman/GooglePlusToRSSFeed ?
- Transformations (make all of them optional?)
    - G+ user references to Twitter ones
    - Include the activity type (link, image, video, ...)
    - Cut title
    - Include hashtags in RSS item content (to filter by them)
    - Use only the first line of activity content as title
