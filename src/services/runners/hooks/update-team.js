/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

// const Q = require('q');


// Hook that updates the rest of the team
// when modifying the team name, the wave type or the wave num
// Indeed, if a typo is corrected, the rest of the team should also have the typo corrected
const updateTeamHook = context => new Promise((resolve, reject) => {
  const runnersService = context.app.service('/runners');
  const newRunner = context.data;
  if (newRunner.team_name || newRunner.wave_id || newRunner.type) {
    runnersService.get(context.id).then((oldRunner) => {
      const changes = {};
      // If something related to the team changed
      if (newRunner.team_name && oldRunner.team_name !== newRunner.team_name) {
        changes.team_name = newRunner.team_name;
      }
      if (newRunner.wave_id && oldRunner.wave_id !== newRunner.wave_id) {
        changes.wave_id = newRunner.wave_id;
      }
      if (newRunner.type && oldRunner.type !== newRunner.type) {
        changes.type = newRunner.type;
      }
      if (changes.team_name || changes.wave_id || changes.type) {
        const promisePatchTeam = runnersService.patch(null,
          changes,
          { query: { team_name: oldRunner.team_name, _id: { $ne: context.id } } });
        promisePatchTeam.then(() => {
          resolve(context);
        }).catch((error) => {
          console.log(error);
          reject(new Error(error));
        });
      } else {
        resolve(context);
      }
    });
  } else {
    resolve(context);
  }
});

module.exports = updateTeamHook;
