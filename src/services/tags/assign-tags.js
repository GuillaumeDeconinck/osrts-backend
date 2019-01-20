/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const Q = require('q');
const auth = require('@feathersjs/authentication');
const moment = require('moment');
const tagsModel = require('./tag-model');
const runnersModel = require('../runners/runner-model');
const wavesModel = require('../waves/wave-model');

require('moment/locale/fr');

moment.locale('fr');

module.exports = (app) => {
  class TagsAssigner {
    create(data, params, callback) {
      const tagsService = this.app.service('/tags');
      const runnersService = this.app.service('/runners');
      const raceService = this.app.service('/race');

      let runners = [];
      let tags = [];
      let waves = [];
      // Promises array and calls to find()
      const promisesArray = [];
      // var promiseRace = raceService.find({});
      // promisesArray.push(promiseRace);
      const promiseTags = tagsModel.find({}).sort({ color: 1, num: 1 });
      promisesArray.push(promiseTags);
      const deferred = Q.defer();
      promisesArray.push(deferred.promise);
      const promiseWaves = wavesModel.find({ chrono: true }).sort({ date: 1, num: 1 });
      promisesArray.push(promiseWaves);

      // Promises to get the data
      // promiseRace.then((raceRetrieved)=>
      // {race = raceRetrieved.data[0]; console.log(raceRetrieved[0]);});
      promiseTags.then((tagsRetrieved) => { tags = tagsRetrieved; });
      promiseWaves.then((wavesRetrieved) => {
        waves = wavesRetrieved;
        const arrayNums = [];
        waves.forEach((wave) => {
          arrayNums.push(wave.num);
        });
        // We query the runners here so that we only get the runners
        // inside waves that have "chrono" equals to true
        const promiseRunners = runnersModel.find({ wave_id: { $in: arrayNums } }).sort({
          date: 1, wave_id: 1, team_name: 1, name: 1,
        });
        promiseRunners.then((runnersRetrieved) => {
          runners = runnersRetrieved;
          deferred.resolve(runners);
        }).catch((error) => {
          console.log(error);
        });
      });
      // Wait that all the promises are finished (in other words, that we get all the data needed)
      Q.allSettled(promisesArray).then(() => {
        let indexTags = 0;
        let indexRunners = 0;
        let currentColor = tags[0].color;
        let currentDate = runners[0].date;
        let onePassDone = false;
        while (indexTags < tags.length && indexRunners < runners.length) {
          const tag = tags[indexTags];
          const runner = runners[indexRunners];
          if (
            (tag.color === currentColor && runner.date !== currentDate && !onePassDone)
            || (tag.assigned && onePassDone)
          ) {
            indexTags += 1;
            continue;
          } else if (tag.color !== currentColor && runner.date !== currentDate) {
            currentColor = tag.color;
            currentDate = runner.date;
          }
          tag.assigned = true;
          tagsService.update(tag._id, tag)
            .then(() => { })
            .catch((error) => { console.log(error); });
          runner.tag = { num: tag.num, color: tag.color };
          runnersService.update(runner._id, runner)
            .then(() => { })
            .catch((error) => { console.log(error); });
          indexTags += 1;
          indexRunners += 1;
          if (indexTags === tags.length && !onePassDone) {
            indexTags = 0;
            onePassDone = true;
          }
        }
        callback();
      });
      raceService.patch(null, { tagsAssigned: true });
    }
    // END OF ASSIGN

    // Setup this service, needed by Feathersjs
    setup(appToSave) {
      this.app = appToSave;
    }
  }

  // Initialize excel-parser service
  app.use('/tags-assigner', new TagsAssigner());

  app.service('/tags-assigner').hooks({
    before: {
      all: [auth.hooks.authenticate('local')],
    },
  });
};
