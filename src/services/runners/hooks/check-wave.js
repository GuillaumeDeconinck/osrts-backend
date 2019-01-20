/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

// const Q = require('q');

// Hook that checks that the wave indeed exists
const checkWaveHook = context => new Promise((resolve, reject) => {
  const runnersService = context.app.service('/runners');
  const wavesService = context.app.service('/waves');
  const newRunner = context.data;
  if (newRunner.wave_id || newRunner.type) {
    runnersService.get(context.id).then((oldRunner) => {
      if (newRunner.wave_id !== oldRunner.wave_id || newRunner.type !== oldRunner.type) {
        const query = {};
        query.num = newRunner.wave_id ? newRunner.wave_id : oldRunner.wave_id;
        query.type = newRunner.type ? newRunner.type : oldRunner.type;
        query.date = oldRunner.date;
        wavesService.find({ query }).then((data) => {
          if (data.total === 1) {
            resolve(context);
          } else {
            reject(new Error('Il n\'y a pas de vague avec ce type et ce numéro !'));
          }
        });
      } else {
        resolve(context);
      }
    });
  } else {
    resolve(context);
  }
});

module.exports = checkWaveHook;
