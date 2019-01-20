/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const auth = require('@feathersjs/authentication');
const globalHooks = require('../../../hooks');
const checkTime = require('./check-time');
const createResult = require('./create-result');

exports.before = {
  all: [auth.hooks.authenticate(['jwt', 'local'])],
  find: [globalHooks.searchRegex],
  get: [],
  create: [checkTime],
  update: [],
  patch: [],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [createResult],
  update: [],
  patch: [],
  remove: [],
};
