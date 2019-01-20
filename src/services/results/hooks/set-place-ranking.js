/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');

const setPlaceRanking = context => new Promise(async (resolve, reject) => {
  try {
    const newContext = context;
    // Variables
    const resultsService = context.app.service('/results');
    const newResult = context.data;
    if (newResult.times['99']) {
      const momentTime = moment(newResult.times['99'].time);
      // Retrieve the results that have a time greater than the one that we want to add.
      const dataResults = await resultsService.find({ paginate: false, query: { date: newResult.date, $sort: { 'times.99.time': 1 } } });
      if (dataResults.length > 0) {
        let index = 0;
        let modified = false;
        dataResults.forEach((r) => {
          index += 1;
          if (moment(r.times['99'].time).isAfter(momentTime)) {
            if (!modified) {
              newContext.data.number = index;
              modified = true;
            }
            resultsService.patch(r._id, { number: index + 1 }).catch((err) => {
              console.log(err);
            });
          }
        });
        if (!modified) {
          newContext.data.number = index + 1;
        }
      } else {
        newContext.data.number = 1;
      }
      resolve(context);
    } else {
      resolve(context);
    }
  } catch (error) {
    reject(error);
  }
});

module.exports = setPlaceRanking;
