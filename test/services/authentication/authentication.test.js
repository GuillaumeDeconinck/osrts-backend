/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../src/app');

const { expect } = chai;

const User = app.service('users');
// const Authentication = app.service('authentication');
chai.use(chaiHttp);

// let token;
const URL = `http://${app.settings.host}:${app.settings.port}`;

describe('user service', () => {
  it('registered the users service', () => {
    expect(app.service('users')).to.be.ok;
  });

  it('registered the authentication service', () => {
    expect(app.service('authentication')).to.be.ok;
  });

  describe('authentication with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      }).then(() => {
        done();
      });
    });

    it('should not authenticate (wrong password)', (done) => {
      chai.request(URL).post('/authentication')
        // set header
        .set('Accept', 'application/json')
        // send credentials
        .send({
          strategy: 'local',
          email: 'admin@shouldnotexist.com',
          password: 'wtf',
        })
        // when finished
        .end((err, res) => {
          expect(res).to.exist;
          expect(res.body.accessToken).to.not.exist;
          expect(res.statusCode).to.equal(401);
          done();
        });
    });

    it('should authenticate successfully', (done) => {
      // setup a request to get authentication token
      chai.request(URL).post('/authentication')
        // set header
        .set('Accept', 'application/json')
        // send credentials
        .send({
          strategy: 'local',
          email: 'admin@shouldexist.com',
          password: 'azerty9',
        })
        // when finished
        .end((err, res) => {
          expect(res.body.accessToken).to.exist;
          // token = res.body.accessToken;
          done();
        });
    });


    after((done) => {
      User.remove(null).then(() => {
        done();
      });
    });
  });


  /* describe('authentication with socket', ()=>{
    var socket;

    before(function(done){
      this.server = app.listen(3030);
      this.server.once('listening', () => {
        User.create({
           'email': 'admin@shouldnotexist.com',
           'password': 'azerty9'
        }, (err, res) => {
          done();
        });
      });
    });

    beforeEach(function(done) {
      //console.log(this.server);
      console.log(app);
      // Setup
      console.log(io);
      console.log("URL ", URL)
      socket = io.connect(URL, {'force new connection': true});
      console.log(socket);
      socket.on('connect', function() {
          console.log('worked...');
          done();
      });
      socket.on('disconnect', function() {
          console.log('disconnected...');
      });
    });

    afterEach(function(done) {
        // Cleanup
        if(socket.connected) {
            console.log('disconnecting...');
            socket.disconnect();
        } else {
            // There will not be a connection unless you have done() in beforeEach,
            // socket.on('connect'...)
            console.log('no connection to break...');
        }
        done();
    });

    it('should authenticate', (done)=>{

      //console.log(this.socket);
      socket.emit('authenticate', {
         'email': 'admin@shouldnotexist.com',
         'password': 'azerty9'
      }, function(err, data){
        console.log(err);
        console.log(data);
        done();
      });
    });

    after(function(done){
       User.remove(null, () => {
         this.server.close(done);
       });
    });

  }); */
});
