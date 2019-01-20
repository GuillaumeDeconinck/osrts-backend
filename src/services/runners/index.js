/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const service = require('feathers-mongoose');
const runner = require('./runner-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: runner,
    lean: true,
    paginate: {
      default: 10,
      max: 25,
    },
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/runners', service(options));

  // Get our initialize service to that we can bind hooks
  const runnersService = app.service('/runners');

  // Set up our before hooks
  runnersService.hooks(hooks);
};
