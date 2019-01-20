/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const service = require('feathers-mongoose');
const wave = require('./wave-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: wave,
    lean: true,
    paginate: {
      default: 15,
      max: 25,
    },
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/waves', service(options));

  // Get our initialize service to that we can bind hooks
  const wavesService = app.service('/waves');

  // Set up our before hooks
  wavesService.hooks(hooks);
};
