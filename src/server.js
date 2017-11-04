"use strict";

require("dotenv").config();
require("newrelic");

const App = require("./App");
const GooglePlus = require("./GooglePlus");
const Feeds = require("./Feeds");
const FeedsCache = require("./feeds/Cache");

process.on("unhandledRejection", error => {
  throw error;
});

FeedsCache.create("persistent/main.db").then(cache => {
  const googlePlus = new GooglePlus(process.env.GOOGLE_API_KEY);
  const feeds = new Feeds({ googlePlus, cache });
  new App(feeds).listen(process.env.PORT || 8080);
});
