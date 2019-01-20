/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');
const errors = require('@feathersjs/errors');

// Hooks that check that the time uploaded is valid
// It must have a timestamp and a checkpoint_id
// It must not have been already uploaded
// The tag must exist and be assigned to a runner
const checkTime = context => new Promise((resolve, reject) => {
  const newContext = context;
  const timesService = context.app.service('/times');
  const tagsService = context.app.service('/tags');
  const newTime = context.data;
  newTime.tag.num = parseInt(newTime.tag.num, 10);
  if (!newTime.timestamp) {
    reject(new Error('No timestamp !'));
    return;
  }
  if (!newTime.checkpoint_id) {
    reject(new Error('No checkpoint !'));
    return;
  }
  const timePromise = timesService.find(
    {
      query: {
        checkpoint_id: newTime.checkpoint_id,
        'tag.num': newTime.tag.num,
        'tag.color': newTime.tag.color,
      },
    },
  );
  const tagPromise = tagsService.find(
    {
      query: {
        num: newTime.tag.num,
        color: newTime.tag.color,
      },
    },
  );
  Q.allSettled([timePromise, tagPromise]).then((results) => {
    if (results[0].value.total !== 0) {
      reject(new errors.Conflict('This tag has already a time at that checkpoint.'));
    } else if (results[1].value.total !== 1) {
      reject(new errors.NotFound('Tag does not exist.'));
    } else if (results[1].value.data[0].assigned === false) {
      reject(new errors.NotAcceptable('Tag is not assigned.'));
    } else {
      delete newContext.data.email;
      delete newContext.data.password;
      const momentTimestamp = moment(newContext.data.timestamp);
      newContext.data.timestamp = momentTimestamp.toDate();
      resolve(context);
    }
  }).catch((err) => {
    console.log('Error in Q.allSettled');
    console.log(err);
  });
});

module.exports = checkTime;
