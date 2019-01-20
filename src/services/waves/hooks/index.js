/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const auth = require('@feathersjs/authentication');

exports.before = {
  all: [auth.hooks.authenticate(['jwt', 'local'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [],
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
