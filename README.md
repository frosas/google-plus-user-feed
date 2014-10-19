# Google+ user feed

Get Google+ user posts as an RSS feed (to export it to Twitter, Facebook, ...)

Use it and get more information at **http://plusfeed.frosas.net/**

## Changelog

2014-10-04

- Posts full body is shown in the feed page

2014-02-22

- Attachment type is not included in the title by default anymore. Add `?include-attachment-type` 
  to the feed URL if you want the previous behaviour.

2013-06-12

- Added posts content (thanks to [John Metta](https://github.com/johnmetta))

## Installation details

- Get [Node.js](http://nodejs.org/)
- `$ npm install`
- `$ GOOGLE_API_KEY=xxx node src/main.js` (see [Google API key](https://developers.google.com/+/api/oauth))
- Visit [http://localhost:8080/](http://localhost:8080/)

## Testing

- `$ bin/test`

## TODO

- Automated testing
- Mark visited links
- Anything to learn from https://github.com/jtwebman/GooglePlusToRSSFeed?
- Allow users to use their own API key, and disable any caching if they do.
- Move away from Heroku
  - Make it easy to maintain ➝ Use Elastic Beanstalk
  - Make it as independent from AWS as possible ➝ Use Docker
  - Can I use Ubuntu instead of Fedora?
  - Consider https://coreos.com/
  - How to work with Docker during development?
    - Map project dir into the container?
