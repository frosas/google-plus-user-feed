# Google+ user feed

Get Google+ user posts as an RSS feed (to export it to Twitter, Facebook, ...)

Use it and get more information at **http://plusfeed.frosas.net/**

## Changelog

2015-12-02

- Fixed a bad encoding of the user ID. User names with accents, or in Chinese, Japanese, Farsi, ... should work as expected now!

2014-10-04

- Posts full body is shown in the feed page

2014-02-22

- Attachment type is not included in the title by default anymore. Add `?include-attachment-type`
  to the feed URL if you want the previous behaviour.

2013-06-12

- Added posts content (thanks to [John Metta](https://github.com/johnmetta))

## Setup

Install [Node](http://nodejs.org/).

Create a [Google API key](https://developers.google.com/+/api/oauth).

```bash
$ echo "GOOGLE_API_KEY=xxx" > .env
$ npm i
$ npm start
```

Visit [http://localhost:8080](http://localhost:8080)

## Development

- `$ npm run watch`
- `$ npm test -- -w`
- `$ npm run lint`