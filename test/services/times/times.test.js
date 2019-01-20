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
const Times = app.service('times');
const Tags = app.service('tags');
chai.use(chaiHttp);

const URL = `http://${app.settings.host}:${app.settings.port}`;

const defaultTime = { checkpoint_id: 1, tag: { num: 1, color: 'bleu' }, timestamp: new Date() };
const defaultTagsRange = { from: 1, to: 10, color: 'bleu' };


describe('times service', () => {
  it('registered the times service', () => {
    expect(Times).to.be.ok;
  });

  describe('testing with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      })
        .then(() => Times.remove(null))
        .then(() => Tags.create(defaultTagsRange))
        .then(data => Tags.patch(data[0]._id, { assigned: true }))
        .then(() => {
          done();
        });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {
      it('should not create the times (not logged in)', (done) => {
        chai.request(URL).post('/times')
          .set('Accept', 'application/json')
          .send(defaultTime)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not find the times (not logged in)', (done) => {
        chai.request(URL).get('/times')
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the time (not logged in)', (done) => {
        chai.request(URL).get(`/times/${1}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a time (not logged in)', (done) => {
        chai.request(URL).put(`/times/${1}`)
          .set('Accept', 'application/json')
          .send({ num: 1, assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a time (not logged in)', (done) => {
        chai.request(URL).patch(`/times/${1}`)
          .set('Accept', 'application/json')
          .send({ assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the time (not logged in)', (done) => {
        chai.request(URL).delete(`/times/${1}`)
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
    /* ### END NOT AUTHENTICATED ### */
    /* ############################# */

    /* ############################# */
    /* ####### AUTHENTICATED ####### */
    /* ############################# */

    describe('while being authenticated', () => {
      let token;
      let times;

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
            if (err) { console.log(res.error); }
            token = res.body.accessToken;
            done();
          });
      });

      it('should create the times', (done) => {
        chai.request(URL).post('/times')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultTime)
          // when finished
          .end((err, res) => {
            if (err) {
              console.log(res.error);
            }
            expect(err).to.not.exist;
            expect(res.body.tag.num).to.exist;
            expect(res.statusCode).to.equal(201);
            done();
          });
      });


      it('should find the times', (done) => {
        chai.request(URL).get('/times')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            times = res.body.data;
            done();
          });
      });


      it('should get a time', (done) => {
        chai.request(URL).get(`/times/${times[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.body.tag.num).to.exist;
            done();
          });
      });

      it('should update a time', (done) => {
        const newTime = Object.assign({}, times[0]);
        newTime.checkpoint_id = 3;
        chai.request(URL).put(`/times/${newTime._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newTime)
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.checkpoint_id).to.equal(newTime.checkpoint_id);
            done();
          });
      });

      it('should patch a time', (done) => {
        chai.request(URL).patch(`/times/${times[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({ tag: { num: 4, color: 'bleu' } })
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.tag.num).to.equal(4);
            done();
          });
      });

      it('should delete a time', (done) => {
        chai.request(URL).delete(`/times/${times[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            done();
          });
      });

      /* ######################## */
      /* ####### ON HOOKS ####### */
      /* ######################## */

      describe('on hook checkTime', () => {
        const invalidTime1 = { checkpoint_id: 1, tag: { num: 1, color: 'bleu' } };
        const invalidTime2 = { tag: { num: 1, color: 'bleu' }, timestamp: new Date() };
        const timeWithUnknownTag = { checkpoint_id: 1, tag: { num: 250, color: 'bleu' }, timestamp: new Date() };
        const timeWithTagNotAssigned = { checkpoint_id: 1, tag: { num: 4, color: 'bleu' }, timestamp: new Date() };
        const correctTime = { checkpoint_id: 1, tag: { num: 1, color: 'bleu' }, timestamp: new Date() };

        it('should not create the time (invalid time - no timestamp)', (done) => {
          chai.request(URL).post('/times')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(invalidTime1)
            // when finished
            .end((err, res) => {
              expect(res).to.exist;
              expect(res.statusCode).to.equal(500);
              done();
            });
        });

        it('should not create the time (invalid time - no checkpoint)', (done) => {
          chai.request(URL).post('/times')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(invalidTime2)
            // when finished
            .end((err, res) => {
              expect(res).to.exist;
              expect(res.statusCode).to.equal(500);
              done();
            });
        });

        it('should not create the time (unknown tag)', (done) => {
          chai.request(URL).post('/times')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(timeWithUnknownTag)
            // when finished
            .end((err, res) => {
              expect(res).to.exist;
              expect(res.statusCode).to.equal(404);
              done();
            });
        });

        it('should not create the time (tag not assigned to a runner)', (done) => {
          chai.request(URL).post('/times')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(timeWithTagNotAssigned)
            // when finished
            .end((err, res) => {
              expect(res).to.exist;
              expect(res.statusCode).to.equal(406);
              done();
            });
        });

        it('should not create the time (already exists)', (done) => {
          chai.request(URL).post('/times')
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send(correctTime)
            // when finished
            .end((err, res) => {
              if (err) { console.log(res.error); }
              expect(err).to.not.exist;
              chai.request(URL).post('/times')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer '.concat(token))
                .send(correctTime)
                // when finished
                .end((err2, res2) => {
                  expect(res2).to.exist;
                  expect(res2.statusCode).to.equal(409);
                  done();
                });
            });
        });
      });

      describe('on hook createResult', () => {
        const Waves = app.service('waves');
        const Results = app.service('results');
        const Runners = app.service('runners');

        const waveNoStartTime = { num: 1, type: 'compet', date: '15-04-2017' };
        const correctWave = {
          num: 1, type: 'compet', date: '15-04-2017', start_time: new Date(),
        };
        const correctTime = { checkpoint_id: 99, tag: { num: 1, color: 'bleu' }, timestamp: new Date() };
        const correctTimeUpdate = { checkpoint_id: 1, tag: { num: 1, color: 'bleu' }, timestamp: new Date() };
        const incorrectRunner = {
          name: 'Runner1',
          team_id: 999,
          team_name: 'Team 1',
          type: 'compet',
          wave_id: 1,
          date: '15-04-2017',
          gender: 'm',
        };
        const correctRunner = {
          name: 'Runner1',
          team_id: 999,
          team_name: 'Team 1',
          tag: { num: 1, color: 'bleu' },
          type: 'compet',
          wave_id: 1,
          date: '15-04-2017',
          gender: 'm',
        };
        const correctTagsRange = { from: 1, to: 10, color: 'bleu' };

        beforeEach((done) => {
          Results.remove(null)
            .then(() => Waves.remove(null))
            .then(() => Times.remove(null))
            .then(() => Runners.remove(null))
            .then(() => Tags.remove(null))
            .then(() => {
              done();
            });
        });


        it('should not create a result (no start time for this wave)', (done) => {
          Tags.create(correctTagsRange)
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Runners.create(correctRunner))
            .then(() => Waves.create(waveNoStartTime))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTime))
            .then(() => {
              expect.fail();
              done();
            })
            .catch((err) => {
              expect(err).to.exist;
              done();
            });
        });

        it('should not create a result (no runner for this tag)', (done) => {
          Tags.create(correctTagsRange)
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Runners.create(incorrectRunner))
            .then(() => Waves.create(correctWave))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTime))
            .then(() => {
              expect.fail();
              done();
            })
            .catch((err) => {
              expect(err).to.exist;
              done();
            });
        });

        it('should create a result', (done) => {
          Tags.create(correctTagsRange)
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Runners.create(correctRunner)).then(() => Waves.create(correctWave))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTime))
            .then(() => Results.find({}))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              done();
            })
            .catch(() => {
              expect.fail();
              done();
            });
        });

        it('should create and patch the result (99 then 1)', (done) => {
          Tags.create(correctTagsRange)
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Runners.create(correctRunner))
            .then(() => Waves.create(correctWave))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTime))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTimeUpdate))
            .then(() => Results.find({}))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].checkpoints_ids).to.include(1);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times).to.have.property(1);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].times['1'].time).to.be.instanceof(Date);
              done();
            })
            .catch((err) => {
              expect(err).to.not.exist;
              done();
            });
        });

        it('should save the time and then create the result with both times (1 then 99)', (done) => {
          Tags.create(correctTagsRange)
            .then(data => Tags.patch(data[0]._id, { assigned: true }))
            .then(() => Runners.create(correctRunner))
            .then(() => Waves.create(correctWave))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTimeUpdate))
            .then(() => chai.request(URL).post('/times')
              .set('Accept', 'application/json')
              .set('Authorization', 'Bearer '.concat(token))
              .send(correctTime))
            .then(() => Results.find({}))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].checkpoints_ids).to.include(1);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times).to.have.property(1);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].times['1'].time).to.be.instanceof(Date);
              done();
            })
            .catch((err) => {
              expect(err).to.not.exist;
              done();
            });
        });

        after((done) => {
          Results.remove(null)
            .then(() => Waves.remove(null))
            .then(() => Runners.remove(null))
            .then(() => Tags.remove(null))
            .then(() => Times.remove(null))
            .then(() => {
              done();
            });
        });
      });

      /* ####### END ON HOOKS ####### */
    });

    /* ############################# */
    /* ##### END AUTHENTICATED ##### */
    /* ############################# */

    after((done) => {
      User.remove(null)
        .then(() => Times.remove(null))
        .then(() => Tags.remove(null))
        .then(() => {
          done();
        });
    });
  });
  // END WITH REST
});
