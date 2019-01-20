/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');

// Hook that updates the dependencies when deleting a runners
// Remove one from the count of persons for its wave and its day
// Set the tag as unassigned
const updateDependencies = context => new Promise((resolve) => {
  const tagsService = context.app.service('/tags');
  const wavesService = context.app.service('/waves');
  const raceService = context.app.service('/race');
  const oldRunner = context.result;
  const arrayPromises = [];
  // Update the tag
  if (oldRunner['tag.num']) {
    const promiseTag = tagsService.patch(
      null,
      { assigned: false },
      { query: { num: oldRunner.tag.num, color: oldRunner.tag.color } },
    );
    arrayPromises.push(promiseTag);
  }
  // Update the wave
  const promiseWave = wavesService.patch(
    null,
    { $inc: { count: -1 } },
    { query: { type: oldRunner.type, num: oldRunner.wave_id, date: oldRunner.date } },
  );
  arrayPromises.push(promiseWave);

  // Update the race
  const key = `counts.${oldRunner.date}`;
  const counts = { $inc: {} };
  counts.$inc[key] = -1;
  const promiseRace = raceService.patch(null, counts);
  arrayPromises.push(promiseRace);

  Q.allSettled(arrayPromises).then(() => {
    resolve(context);
  });
});

module.exports = updateDependencies;
