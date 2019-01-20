/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const XLSX = require('xlsx');
const Q = require('q');
const auth = require('@feathersjs/authentication');

const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');

const PRO_WAVE_NAME = 'compet';

module.exports = (app) => {
  const runnersService = app.service('/runners');
  const wavesService = app.service('/waves');
  const raceService = app.service('/race');
  const tagsService = app.service('/tags');

  class ExcelParser {
    constructor() {
      this.events = ['status'];
      this.step = 0;
      this.nbSteps = 0;
    }

    create(dataHook) {
      return new Promise((resolve, reject) => {
        try {
          // Reading excel
          const data = new Uint8Array(dataHook);
          const arr = [];
          for (let i = 0; i !== data.length; i += 1) {
            arr[i] = String.fromCharCode(data[i]);
          }
          const bstr = arr.join('');
          const excel = XLSX.read(bstr, { type: 'binary' });

          // Define the step and nbSteps to show some progression on the frontend
          this.step = 0;
          this.nbSteps = excel.SheetNames.length * 2 + 4;
          // *2 => Reading + uploading
          // +3 => remove old runners, add waves, update race with counts and final step

          // Return the request to say that it is successfully processing the excel
          resolve({ status: 'success', nbSteps: this.nbSteps });
          // Precise the current status
          this.incrementAndEmitStatus();

          // Delete old runners and waves then parse the excel
          Q.allSettled([
            runnersService.remove(null, {}),
            wavesService.remove(null, {})],
          tagsService.patch(null, { assigned: false }, {})).then(() => {
            const promiseArray = [];
            const waves = {};
            const countByDays = {};

            excel.SheetNames.forEach((sheetName) => {
              const worksheet = excel.Sheets[sheetName];
              // const day = sheetName.split(' ')[0];
              const type = sheetName.split(' ')[1].toLowerCase();

              // Getting the date
              const date = moment(worksheet.A1.v, 'dddd DD MMMM YYYY');
              const dateString = date.format('DD-MM-YYYY');
              const newRunners = [];
              const dict = {};
              this.incrementAndEmitStatus();

              worksheet.forEach((z) => {
                /* all keys that do not begin with '!' correspond to cell addresses */
                if (z[0] === '!') {
                  return;
                }

                const column = z[0];
                const row = parseInt(z.slice(1), 10);

                if (row <= 2) {
                  return;
                }

                if (!(row in dict)) {
                  dict[row] = {};
                }

                dict[row][column] = worksheet[z].w;
              });

              // Go through the key/value that we stored
              Object.keys(dict).forEach((key) => {
                const value = dict[key];
                // If no name, don't take the row
                if (!value.G) {
                  return;
                }
                // Runner
                const runner = {
                  tag_id: value.C ? parseInt(value.C, 10) : -1,
                  team_id: value.D ? parseInt(value.D, 10) : -1,
                  name: value.G ? ExcelParser.normalizeName(value.G) : '',
                  gender: value.H ? value.H : '',
                  age: value.I ? parseInt(value.I, 10) : '',
                  team_name: value.J ? value.J : '',
                  wave_id: value.K ? parseInt(value.K, 10) : -1,
                  date: dateString,
                  type,
                };
                newRunners.push(runner);
                // Wave
                if (runner.wave_id !== -1) {
                  if (!waves[`${type} ${runner.wave_id} ${dateString}`]) {
                    waves[`${type} ${runner.wave_id} ${dateString}`] = {
                      type, num: runner.wave_id, date: dateString, count: 1,
                    };
                    if (type === PRO_WAVE_NAME) {
                      waves[`${type} ${runner.wave_id} ${dateString}`].chrono = true;
                    }
                  } else {
                    waves[`${type} ${runner.wave_id} ${dateString}`].count += 1;
                  }
                }
                // Race
                if (!countByDays[dateString]) {
                  countByDays[dateString] = 1;
                } else {
                  countByDays[dateString] += 1;
                }
              });
              // Launch the creation of the runners of this excel page (non-blocking)
              const promise = runnersService.create(newRunners);
              promise.then(() => {
                this.incrementAndEmitStatus();
              });
              promiseArray.push(promise);
            });

            // Create the waves
            const wavesArray = [];
            Object.keys(waves).forEach((key) => {
              wavesArray.push(waves[key]);
            });
            const wavePromise = wavesService.create(wavesArray);
            wavePromise.then(() => {
              this.incrementAndEmitStatus();
            });
            promiseArray.push(wavePromise);
            // End of creation of waves

            // Update the race
            const racePromise = raceService.patch(null, { counts: countByDays });
            racePromise.then(() => {
              this.incrementAndEmitStatus();
            });
            promiseArray.push(racePromise);

            // Wait that all the 'create' are finished
            Q.allSettled(promiseArray).then((results) => {
              results.forEach((result) => {
                if (result.state === 'fulfilled') {
                  // const { value } = result;
                } else {
                  // const { reason } = result;
                }
              });
              // Step here has to be equal to nbStep, which will finish the waiting on the frontend
              this.incrementAndEmitStatus();
            });

            // End of remove
          });
        } catch (error) {
          reject(error);
        }
      });
    }
    // END OF PARSING

    static normalizeName(name) {
      const nameTrimmed = name.trim();
      let newName = '';
      nameTrimmed.split(' ').forEach((part) => {
        newName = `${newName + part.substring(0, 1).toUpperCase() + part.substring(1).toLowerCase()} `;
      });
      return newName.trim();
    }

    incrementAndEmitStatus() {
      this.step += 1;
      this.emit('status', { step: this.step, nbSteps: this.nbSteps });
    }

    // Setup this service, needed by Feathersjs
    setup(appToKeep) {
      this.app = appToKeep;
    }
  }


  // Initialize excel-parser service
  app.use('/excel-parser', new ExcelParser());

  app.service('/excel-parser').hooks({
    before: {
      all: [auth.hooks.authenticate(['jwt', 'local'])],
    },
  });
};
