/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const service = require('feathers-mongoose');
const user = require('./user-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: user,
    lean: true,
    paginate: {
      default: 5,
      max: 25,
    },
    multi: true,
  };

  // Initialize our service with any options it requires
  app.use('/users', service(options));


  // Get our initialize service to that we can bind hooks
  const userService = app.service('/users');

  // Set up our before hooks
  userService.hooks(hooks);

  // Creates an administrator
  userService.find({}).then((data) => {
    if (data.total === 0) {
      userService.create({
        email: 'test@test.test',
        password: 'test',
      }).then(() => {
        console.log('Created an administrator | email=\'test@test.test\' - password=\'test\'');
      }).catch((error) => {
        console.log(error);
      });
    }
  });
};
