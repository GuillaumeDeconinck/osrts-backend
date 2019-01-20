/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
const moment = require('moment');

// Hook that counts the number of runners that have passed by a checkpoint
const countTimes = context => new Promise((resolve) => {
  const newContext = context;
  // Services
  const timesService = context.app.service('/times');
  const promises = [];
  if (context.result.data) {
    context.result.data.forEach((item) => {
      const newItem = item;
      promises.push(timesService.find({
        query: {
          checkpoint_id: item.num,
          timestamp: {
            $gte: moment().startOf('day'),
            $lt: moment().add(1, 'days').startOf('day'),
          },
        },
      }).then((data) => {
        newItem.count = data.total;
      }));
    });
  } else if (context.result && context.result.num) {
    promises.push(timesService.find({
      query: {
        checkpoint_id: context.result.num,
        timestamp: {
          $gte: moment().startOf('day'),
          $lt: moment().add(1, 'days').startOf('day'),
        },
      },
    }).then((data) => {
      newContext.result.count = data.total;
    }));
  } else {
    resolve(context);
    return;
  }

  Q.allSettled(promises).then(() => {
    resolve(context);
  });
});

module.exports = countTimes;
