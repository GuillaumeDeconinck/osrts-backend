/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const { iff, isProvider } = require('feathers-hooks-common');
const auth = require('@feathersjs/authentication');
const globalHooks = require('../../../hooks');
const checkAndUpdateTag = require('./check-update-tag');
const checkWave = require('./check-wave');
const updateTeam = require('./update-team');
const updateDependencies = require('./remove-update-dependencies');

exports.before = {
  all: [auth.hooks.authenticate(['jwt', 'local'])],
  find: [globalHooks.searchRegex],
  get: [],
  create: [],
  update: [iff(isProvider('external'), checkAndUpdateTag),
    iff(isProvider('external'), checkWave),
    iff(isProvider('external'), updateTeam)],
  patch: [iff(isProvider('external'), checkAndUpdateTag),
    iff(isProvider('external'), checkWave),
    iff(isProvider('external'), updateTeam)],
  remove: [],
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: iff(isProvider('external'), updateDependencies),
};
