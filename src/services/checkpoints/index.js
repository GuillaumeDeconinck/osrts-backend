/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const service = require('feathers-mongoose');
const checkpoint = require('./checkpoint-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: checkpoint,
    lean: true,
    paginate: {
      default: 15,
      max: 25,
    },
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/checkpoints', service(options));

  // Get our initialize service to that we can bind hooks
  const checkpointsService = app.service('/checkpoints');

  // Set up our before hooks
  checkpointsService.hooks(hooks);
};
