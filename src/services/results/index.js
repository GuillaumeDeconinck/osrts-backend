/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const service = require('feathers-mongoose');
const result = require('./result-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: result,
    lean: true,
    paginate: {
      default: 15,
      max: 25,
    },
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/results', service(options));

  // Get our initialize service to that we can bind hooks
  const resultsService = app.service('/results');

  // Set up our before hooks
  resultsService.hooks(hooks);
};
