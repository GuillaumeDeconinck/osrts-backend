module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "mocha"
  ],
  "rules": {
    "no-underscore-dangle": "off",
    "no-continue": "off",
  },
  "env": {
    "node": true,
    "mocha": true
  }
};