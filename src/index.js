/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const app = require('./app');

const port = app.get('port');
const server = app.listen(port);

const nodeEnv = process.env.NODE_ENV || 'development';

server.on('listening', () => {
  console.log(`Feathers application started on ${app.get('host')}:${port}`);
  console.log(`Env: ${nodeEnv}`);
});
