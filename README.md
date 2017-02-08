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

## Installation details

- Get [Node.js](http://nodejs.org/)
- `$ npm install`
- `$ GOOGLE_API_KEY=xxx node src/server.js` (see [Google API key](https://developers.google.com/+/api/oauth))
- Visit [http://localhost:8080/](http://localhost:8080/)

## Testing

- `$ bin/test`

## Internals

```sql
# Feeds per day (to tweak the cache)
SELECT date / 86400000 AS day, count(*) FROM cachedUserItems GROUP BY day ORDER BY day;
```

## TODO

- Automated testing
- Mark visited links
- Anything to learn from https://github.com/jtwebman/GooglePlusToRSSFeed?
- Allow users to use their own API key, and disable any caching if they do.
- Store cache in a datastore
- node 0.10 → 0.12
- Expand images
- Go serverless
  - Fix caching
  - Fix New Relic
  - Load resources relatively
  - Enable custom domain
    - Obtain an SSL certificate