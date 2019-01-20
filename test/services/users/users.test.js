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

const URL = `http://${app.settings.host}:${app.settings.port}`;

const defaultUsers = {};

describe('user service', () => {
  it('registered the users service', () => {
    expect(app.service('users')).to.be.ok;
  });

  it('registered the authentication service', () => {
    expect(app.service('authentication')).to.be.ok;
  });

  describe('testing with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      }).then(() => {
        done();
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {
      it('should not create the users (disabled on external)', (done) => {
        chai.request(URL).post('/users')
          .set('Accept', 'application/json')
          .send(defaultUsers)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the users (not logged in)', (done) => {
        chai.request(URL).get('/users')
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the user (not logged in)', (done) => {
        chai.request(URL).get(`/users/${1}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a user (disabled on external)', (done) => {
        chai.request(URL).put(`/users/${1}`)
          .set('Accept', 'application/json')
          .send(defaultUsers)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a user (disabled on external)', (done) => {
        chai.request(URL).patch(`/users/${1}`)
          .set('Accept', 'application/json')
          .send(defaultUsers)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the user (disabled on external)', (done) => {
        chai.request(URL).delete(`/users/${1}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });
    });

    /* ############################# */
    /* ####### AUTHENTICATED ####### */
    /* ############################# */

    describe('while being authenticated', () => {
      let token;
      let users;

      const newUser = { email: 'test@test.test', password: 'test' };

      before((done) => {
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
            if (err) { console.log(err.response.error); }
            token = res.body.accessToken;
            done();
          });
      });

      it('should create the user', (done) => {
        chai.request(URL).post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newUser)
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });


      it('should find the users', (done) => {
        chai.request(URL).get('/users')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            users = res.body.data;
            done();
          });
      });


      it('should get a user', (done) => {
        chai.request(URL).get(`/users/${users[1]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });

      it('should not update a user (disabled on external)', (done) => {
        chai.request(URL).put(`/users/${users[1]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultUsers)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should patch a user', (done) => {
        chai.request(URL).patch(`/users/${users[1]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({ name: 'test' })
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });

      it('should delete a user', (done) => {
        chai.request(URL).delete(`/users/${users[1]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });
    });
    // END WITH BEING AUTHENTICATED

    describe('on hook atLeastOneAdmin', () => {
      let token;
      let users;

      // const newUser = { email: 'test@test.test', password: 'test' };

      before((done) => {
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
            if (err) { console.log(err.response.error); }
            token = res.body.accessToken;
            chai.request(URL).get('/users')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              // when finished
              .end((err2, res2) => {
                users = res2.body.data;
                done();
              });
          });
      });

      it('should not delete the last admin', (done) => {
        chai.request(URL).delete(`/users/${users[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.equal(500);
            done();
          });
      });
    });

    after((done) => {
      User.remove(null).then(() => {
        done();
      });
    });
  });
});
