/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


// const Q = require('q');
const auth = require('@feathersjs/authentication');
const csv = require('fast-csv');

module.exports = (app) => {
  const timesService = app.service('/times');
  class TimesParser {
    constructor() {
      this.events = ['status'];
      this.step = 0;
      this.nbSteps = 0;
    }

    create(dataCreate, params, callback) {
      // Reading txt
      const data = new Uint8Array(dataCreate);
      const arr = [];
      for (let i = 0; i !== data.length; i += 1) {
        arr[i] = String.fromCharCode(data[i]);
      }
      const bstr = arr.join('');

      // Define the step and nbSteps to show some progression on the frontend
      this.step = 0;
      this.nbSteps = bstr.split('\n').length;

      // Return the request to say that it is successfully processing the excel
      callback(null, {
        status: 'success',
        nbSteps: this.nbSteps,
      });
      // Precise the current status
      this.incrementAndEmitStatus();

      const times = [];
      csv.fromString(bstr).on('data', (data2) => {
        const time = {
          checkpoint_id: data2[0],
          tag: {
            num: data2[1],
            color: data2[2],
          },
          timestamp: data2[3],
        };

        times.push(time);
      }).on('end', () => {
        // Sequential creation to avoid integrity errors
        let promise = Promise.resolve(null);
        times.forEach((value) => {
          promise = promise.then(() => timesService.create(value)).then(() => {
            this.incrementAndEmitStatus();
          }).catch((err) => {
            console.log(`Error : ${err.message}`);
            this.incrementAndEmitStatus();
          });
        });
      });
    }

    // END OF PARSING
    incrementAndEmitStatus() {
      this.step += 1;
      this.emit('status', {
        step: this.step,
        nbSteps: this.nbSteps,
      });
    }

    // Setup this service, needed by Feathersjs
    setup(appToSave) {
      this.app = appToSave;
    }
  }

  // Initialize excel-parser service
  app.use('/times-parser', new TimesParser());

  app.service('/times-parser').hooks({
    before: {
      all: [auth.hooks.authenticate('local')],
    },
  });
};
