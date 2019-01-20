/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const hooks = require('feathers-hooks-common');
const auth = require('@feathersjs/authentication');
const globalHooks = require('../../../hooks');
const setPlaceRanking = require('./set-place-ranking');
const computeSpeed = require('./compute-speed');

exports.before = {
  all: [],
  find: [globalHooks.searchRegex],
  get: [hooks.disallow('external')],
  create: [hooks.disallow('external'), setPlaceRanking, computeSpeed],
  update: [hooks.disallow('external')],
  patch: [hooks.disallow('external')],
  remove: [auth.hooks.authenticate(['local', 'jwt'])],
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
