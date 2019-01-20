/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const auth = require('@feathersjs/authentication');
// const globalHooks = require('../../../hooks');
const updateRunners = require('./update-runners');

exports.before = {
  all: [auth.hooks.authenticate(['jwt', 'local'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [updateRunners],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
