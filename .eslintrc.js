module.exports = {
  env: { node: true, es6: true },
  parserOptions: { ecmaVersion: 2017 },
  extends: ["eslint:recommended"],
  plugins: ["prettier"],
  rules: { "prettier/prettier": "error" }
};
