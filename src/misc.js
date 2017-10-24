"use strict";

const cheerio = require("cheerio");

exports.cut = function(string, length) {
  if (string.length > length) string = string.slice(0, length - 2) + "…";
  return string;
};

exports.htmlToPlain = function(html) {
  const $ = cheerio.load(html);
  $("p,div,br")
    .before(" ")
    .after(" ");
  return $.text()
    .replace(/\s+/g, " ")
    .trim();
};
