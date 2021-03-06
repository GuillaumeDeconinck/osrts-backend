/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

// Hook that checks that there are only one race maximum at all time in the system
const checkOnlyOneExists = context => {
  return new Promise((resolve, reject) => {
    // Services
    const raceService = context.app.service('/race');
    raceService.find({}).then(data=>{
      if(data.total>=1){
        reject(new Error('A race already exists !'));
      } else {
        resolve(context);
      }
    });
  });
};

module.exports = checkOnlyOneExists;
