/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const hooks = require('feathers-hooks-common');
const { iff, isProvider } = require('feathers-hooks-common');
const auth = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const atLeastOneAdmin = require('./at-least-one-admin');

exports.before = {
  all: [],
  find: [auth.hooks.authenticate(['jwt', 'local'])],
  get: [auth.hooks.authenticate(['jwt', 'local'])],
  create: [auth.hooks.authenticate(['jwt', 'local']), local.hooks.hashPassword()],
  update: [hooks.disallow('external')],
  patch: [auth.hooks.authenticate(['jwt', 'local']), local.hooks.hashPassword()],
  remove: [auth.hooks.authenticate(['jwt', 'local']), iff(isProvider('external'), atLeastOneAdmin)],
};
exports.after = {
  all: [local.hooks.protect('password')],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
};
