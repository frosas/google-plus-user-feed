const assert = require("assert");
const misc = require("../../src/misc");

describe("src/misc", () => {
  describe("htmlToPlain", () => {
    it("converts HTML to plain text", () => {
      assert.equal(misc.htmlToPlain("<p>a</p>"), "a");
    });

    it("removes extra spaces", () => {
      assert.equal(misc.htmlToPlain(" a  b "), "a b");
    });

    it("spaces out paragraphs", () => {
      assert.equal(misc.htmlToPlain("a<p>b</p><p>c</p>d"), "a b c d");
    });

    it("spaces out line breaks", () => {
      assert.equal(misc.htmlToPlain("a<br>b"), "a b");
    });

    it("spaces out divs", () => {
      assert.equal(misc.htmlToPlain("a<div>b</div><div>c</div>d"), "a b c d");
    });
  });
});
