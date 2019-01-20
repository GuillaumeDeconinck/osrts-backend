/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that deletes all the old data when creating a new race
const resetAll = context => new Promise((resolve) => {
  // Services
  const resultsService = context.app.service('/results');
  const runnersService = context.app.service('/runners');
  const wavesService = context.app.service('/waves');
  const timesService = context.app.service('/times');
  const tagsService = context.app.service('/tags');
  const checkpointsService = context.app.service('/checkpoints');

  const promiseResults = resultsService.remove(null, {});
  const promiseRunners = runnersService.remove(null, {});
  const promiseWaves = wavesService.remove(null, {});
  const promiseTimes = timesService.remove(null, {});
  const promiseTags = tagsService.patch(null, { assigned: false }, {});
  const promiseCheckpoints = checkpointsService.patch(null, { uploaded: false }, {});

  Q.allSettled([
    promiseResults,
    promiseRunners,
    promiseWaves,
    promiseTimes,
    promiseTags,
    promiseCheckpoints,
  ]).then(() => {
    resolve(context);
  });
});

module.exports = resetAll;
