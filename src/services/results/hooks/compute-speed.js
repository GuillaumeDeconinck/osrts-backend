/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


// Hook that computes the speed of the runner when creating the result
const computeSpeed = context => new Promise((resolve) => {
  const newResult = context.data;
  const checkpointsService = context.app.service('/checkpoints');
  checkpointsService.find().then((checkpoints) => {
    for (let i = 0; i < checkpoints.data.length; i += 1) {
      const checkpoint = checkpoints.data[i];
      if (newResult.times[checkpoint.num]) {
        const minutes = newResult.times[checkpoint.num].time.getTime() / 1000 / 60;
        const speed = parseFloat(((checkpoint.distance / minutes) * 60) / 1000).toFixed(2);
        newResult.times[checkpoint.num].speed = speed;
      }
    }
    resolve(context);
  });
});

module.exports = computeSpeed;
