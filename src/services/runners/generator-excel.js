/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


const _ = require('lodash');
const XLSX = require('xlsx');
const jwt = require('jsonwebtoken');
const fs = require('fs');
// const ejs = require('ejs');
// const phantom = require('phantom');
// const path = require('path');
const moment = require('moment');
require('moment/locale/fr');

moment.locale('fr');

// const PRO_WAVE_NAME = 'compet';

module.exports = (app) => {
  const runnersService = app.service('/runners');

  function checkAccessToken(req, res, next) {
    const options = app.get('auth');
    jwt.verify(req.headers.authentification, options.secret, options, (error) => {
      if (error) {
        console.error('user not authenticated');
        res.status(500).send('User not authenticated!');
      } else {
        // User is logged on in the application.
        next();
      }
    });
  }

  async function retrieveData() {
    const dataSorted = {};
    const runners = await runnersService.find({
      paginate: false,
      query: {
        $sort: {
          date: 1,
          wave_id: 1,
          team_name: 1,
          name: 1,
        },
      },
    });
    runners.forEach((item) => {
      if (!(item.date in dataSorted)) {
        dataSorted[item.date] = {};
      }
      if (!(item.wave_id in dataSorted[item.date])) {
        dataSorted[item.date][item.wave_id] = {};
      }
      dataSorted[item.date][item.wave_id][item._id] = item;
    });
    return dataSorted;
  }

  function generateFormattedData(date, mapWaves) {
    const data = [];
    data.push([date]);
    data.push(['Vague', 'Type', 'Team', 'Nom', 'Tag']);
    _.each(mapWaves, (mapRunners) => {
      _.each(mapRunners, (runner) => {
        const tagString = runner.tag ? `${runner.tag.color} - ${runner.tag.num}` : '';
        data.push([runner.wave_id, runner.type, runner.team_name, runner.name, tagString]);
      });
    });
    return data;
  }

  async function generateExcel(req, res) {
    let filename = 'write.xlsx';
    const dataSorted = await retrieveData();


    const wb = XLSX.utils.book_new();

    _.each(dataSorted, (mapWaves, date) => {
      const dataFormatted = generateFormattedData(date, mapWaves);
      const ws = XLSX.utils.aoa_to_sheet(dataFormatted);
      ws['!cols'] = [{ width: 10 }, { width: 12 }, { width: 30 }, { width: 30 }, { width: 14 }];
      /* add worksheet to workbook */
      XLSX.utils.book_append_sheet(wb, ws, date);
    });
    XLSX.writeFile(wb, filename);

    // var stream = XLSX.stream.to_csv(wb);
    const stream = fs.createReadStream(`${filename}`);
    // Prepare the response and sand it to the client
    filename = encodeURIComponent(filename);
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    stream.pipe(res);
  }

  // Initialize generator-runners-pdf route (this is express !)
  app.get('/generator-runners-excel', checkAccessToken, generateExcel);
};
