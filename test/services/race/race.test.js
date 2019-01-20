/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/
/* eslint no-unused-expressions: 0 */

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../../src/app');

const { expect } = chai;
// const io = require('socket.io-client');

const User = app.service('users');
const Race = app.service('race');
const raceModel = require('../../../src/services/race/race-model');

chai.use(chaiHttp);

// let token;
const URL = `http://${app.settings.host}:${app.settings.port}`;

const defaultRace = { place: 'Sart Tilman', from: '15-04-2017', to: '16-04-2017' };

describe('race service', () => {
  it('registered the race service', () => {
    expect(app.service('race')).to.be.ok;
  });

  describe('testing with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      }).then(() => {
        raceModel.remove({}).then(() => { // raceModel for bypassing the hook disabling remove
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {
      before((done) => {
        Race.create(defaultRace).then(() => {
          done();
        });
      });

      let race;

      it('should not create the race (not logged in)', (done) => {
        chai.request(URL).post('/race')
          .set('Accept', 'application/json')
          .send(defaultRace)
          // when finished
          .end((_err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the race', (done) => {
        chai.request(URL).get('/race')
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.body.data).to.exist;
            [race] = res.body.data;
            done();
          });
      });

      it('should not get the race (disabled)', (done) => {
        chai.request(URL).get(`/race/${race._id}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update the race (not logged in)', (done) => {
        chai.request(URL).put(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .send({ place: 'ShouldNotWork' })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch the race (not logged in)', (done) => {
        chai.request(URL).patch(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .send({ place: 'ShouldNotWork' })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the race (disabled)', (done) => {
        chai.request(URL).delete(`/race/${race._id}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      after((done) => {
        raceModel.remove(null, () => {
          done();
        });
      });
    });

    /* ############################# */
    /* ####### AUTHENTICATED ####### */
    /* ############################# */

    describe('while being authenticated', () => {
      let token;
      let race;

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
            token = res.body.accessToken;
            done();
          });
      });

      it('should create a race', (done) => {
        chai.request(URL).post('/race')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultRace)
          // when finished
          .end((err, res) => {
            expect(res.body.from).to.exist;
            done();
          });
      });

      it('should find the race', (done) => {
        chai.request(URL).get('/race')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.body.data).to.exist;
            [race] = res.body.data;
            done();
          });
      });

      it('should not get the race (disabled)', (done) => {
        chai.request(URL).get(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            done();
          });
      });

      it('should update the race', (done) => {
        const newRace = Object.assign({}, race);
        newRace.from = '14-04-2017';
        chai.request(URL).put(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newRace)
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.from).to.exist;
            race = res.body;
            expect(race.from).to.equal(newRace.from);
            done();
          });
      });

      it('should patch the race', (done) => {
        chai.request(URL).patch(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({ from: '15-04-2017' })
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.from).to.exist;
            race = res.body;
            expect(race.from).to.equal(defaultRace.from);
            done();
          });
      });

      it('should not delete the race (disabled)', (done) => {
        chai.request(URL).delete(`/race/${race._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      /* ######################## */
      /* ####### ON HOOKS ####### */
      /* ######################## */

      describe('on hook onlyOne', () => {
        it('should not create the race (already one)', (done) => {
          chai.request(URL).post('/race')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(defaultRace)
            // when finished
            .end((err, res) => {
              expect(res.error).to.exist;
              expect(res.statusCode).to.equal(500);
              done();
            });
        });
      });

      describe('on hook resetAll', () => {
        const Waves = app.service('waves');
        const Times = app.service('times');
        const Runners = app.service('runners');
        const Tags = app.service('tags');

        const correctWave = {
          num: 1, type: 'compet', date: '15-04-2017', start_time: new Date(),
        };
        const correctTime = { checkpoint_id: 99, tag: { num: 1, color: 'bleu' }, timestamp: new Date() };
        const correctRunner = {
          name: 'Runner1',
          team_id: 999,
          team_name: 'Team 1',
          tag: { num: 1, color: 'bleu' },
          type: 'compet',
          wave_id: 1,
          date: '15-04-2017',
          gender: 'M',
        };
        const correctTagsRange = { from: 1, to: 10, color: 'bleu' };

        before((done) => {
          Waves.create(correctWave)
            .then(() => Runners.create(correctRunner))
            .then(() => Tags.create(correctTagsRange))
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Times.create(correctTime))
            .then(() => {
              done();
            });
        });

        it('should update the race and reset all data', (done) => {
          const newRace = Object.assign({}, race);
          newRace.place = 'AnotherPlace';
          chai.request(URL).put(`/race/${newRace._id}`)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(newRace)
            // when finished
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body.place).to.equal('AnotherPlace');
              Times.find({})
                .then((data) => {
                  expect(data.total).to.equal(0);
                  return Runners.find({});
                })
                .then((data) => {
                  expect(data.total).to.equal(0);
                  return Times.find({});
                })
                .then((data) => {
                  expect(data.total).to.equal(0);
                  return Waves.find({});
                })
                .then((data) => {
                  expect(data.total).to.equal(0);
                  done();
                });
            });
        });

        after((done) => {
          Tags.remove(null).then(() => {
            done();
          });
        });
      });

      /* ######################### */
      /* ####### END HOOKS ####### */
      /* ######################### */
    });
    // END WITH BEING AUTHENTICATED

    after((done) => {
      User.remove(null).then(() => {
        done();
      });
    });
  });
  // END WITH REST
});
