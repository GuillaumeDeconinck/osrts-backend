/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const { Service } = require('feathers-mongoose');
const tag = require('./tag-model');
const race = require('../race/race-model');
const hooks = require('./hooks');

module.exports = (app) => {
  const options = {
    Model: tag,
    lean: true,
    paginate: {
      default: 10,
      max: 25,
    },
    multi: true,
  };

  class CustomServiceForTags extends Service {
    create(data) {
      if (data && data.from && data.color) {
        if (data.to && data.to > 0 && data.to > data.from) {
          const tagsArray = [];
          for (let i = data.from; i <= data.to; i += 1) {
            tagsArray.push({ num: i, color: data.color });
          }
          race.update(null, { $addToSet: { tagsColor: data.color } }).exec();
          return tag.create(tagsArray).then((data2) => {
            data2.forEach((tag2) => {
              this.emit('created', tag2);
            });
            return data2;
          });
        }
        return tag.create({ num: data.from, color: data.color }).then((tag2) => {
          this.emit('created', tag2);
          return tag2;
        });
      }
      return undefined;
    }
  }

  // Initialize our service with any options it requires
  app.use('/tags', new CustomServiceForTags(options));

  // Get our initialize service so that we can bind hooks
  const tagsService = app.service('/tags');

  // Set up our before hooks
  tagsService.hooks(hooks);
};
