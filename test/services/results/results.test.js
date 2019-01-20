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
const Results = app.service('results');
chai.use(chaiHttp);

const URL = `http://${app.settings.host}:${app.settings.port}`;

const defaultResults = {};

describe('results service', () => {
  it('registered the results service', () => {
    expect(app.service('results')).to.be.ok;
  });

  describe('testing with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      }).then(() => {
        Results.remove(null).then(() => {
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {
      it('should not create the results (disabled on external)', (done) => {
        chai.request(URL).post('/results')
          .set('Accept', 'application/json')
          .send(defaultResults)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the results (authorized without being logged in)', (done) => {
        chai.request(URL).get('/results')
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.statusCode).to.equal(200);
            done();
          });
      });

      it('should not get the result (disabled on external)', (done) => {
        chai.request(URL).get(`/results/${1}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a result (disabled on external)', (done) => {
        chai.request(URL).put(`/results/${1}`)
          .set('Accept', 'application/json')
          .send({ num: 1, assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a result (disabled on external)', (done) => {
        chai.request(URL).patch(`/results/${1}`)
          .set('Accept', 'application/json')
          .send({ assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the result (disabled on external)', (done) => {
        chai.request(URL).delete(`/results/${1}`)
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

      it('should not create the results (disabled on external)', (done) => {
        chai.request(URL).post('/results')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultResults)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });


      it('should find the results', (done) => {
        chai.request(URL).get('/results')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            if (err) { console.log(res.error); }
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            done();
          });
      });


      it('should not get a result (disabled on external)', (done) => {
        chai.request(URL).get(`/results/${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should not update a result (disabled on external)', (done) => {
        chai.request(URL).put(`/results/${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultResults)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should not patch a result (disabled on external)', (done) => {
        chai.request(URL).patch(`/results/${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({ title: 'Boucle4' })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should delete a result', (done) => {
        chai.request(URL).delete(`/results/${1}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            // Does not find the result with id 1, however it tries meaning that it works
            expect(res.statusCode).to.equal(400);
            done();
          });
      });

      /* ####### ON HOOKS ####### */

      describe('on hook setPlace', () => {
        const Waves = app.service('waves');
        const Runners = app.service('runners');
        const Tags = app.service('tags');
        const Times = app.service('times');

        const correctWave = {
          num: 1, type: 'compet', date: '15-04-2017', start_time: new Date('2017-04-15T13:15:00+00:00'),
        };
        const correctTime1 = { checkpoint_id: 99, tag: { num: 1, color: 'bleu' }, timestamp: new Date('2017-04-15T14:15:00+00:00') };
        const correctRunner1 = {
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


        let tags;

        before((done) => {
          Results.remove(null)
            .then(() => Waves.remove(null))
            .then(() => Times.remove(null))
            .then(() => Runners.remove(null))
            .then(() => Tags.remove(null))
            .then(() => {
              done();
            });
        });

        it('should create a result with number n°1', (done) => {
          Tags.create(correctTagsRange).then((data) => {
            tags = data;
            return Tags.patch(data[0]._id, { assigned: true });
          }).then(() => Runners.create(correctRunner1)).then(() => Waves.create(correctWave))
            .then(() => Times.create(correctTime1))
            .then(() => Results.find({}))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].number).to.equal(1);
              done();
            })
            .catch((err) => {
              if (err) { console.log(err); }
              expect.fail();
              done();
            });
        });

        const correctTime2 = { checkpoint_id: 99, tag: { num: 2, color: 'bleu' }, timestamp: new Date('2017-04-15T14:45:00+00:00') };
        const correctRunner2 = {
          name: 'Runner2',
          team_id: 999,
          team_name: 'Team 1',
          tag: { num: 2, color: 'bleu' },
          type: 'compet',
          wave_id: 1,
          date: '15-04-2017',
          gender: 'M',
        };

        it('should create a result with number n°2', (done) => {
          Tags.patch(tags[1]._id, { assigned: true })
            .then(() => Runners.create(correctRunner2))
            .then(() => Times.create(correctTime2))
            .then(() => Results.find({ query: { 'tag.num': correctRunner2.tag.num, 'tag.color': correctRunner2.tag.color } }))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].number).to.equal(2);
              done();
            })
            .catch((err) => {
              if (err) { console.log(err); }
              expect.fail();
              done();
            });
        });

        const correctTime3 = { checkpoint_id: 99, tag: { num: 3, color: 'bleu' }, timestamp: new Date('2017-04-15T14:30:00+00:00') };
        const correctRunner3 = {
          name: 'Runner3',
          team_id: 999,
          team_name: 'Team 1',
          tag: { num: 3, color: 'bleu' },
          type: 'compet',
          wave_id: 1,
          date: '15-04-2017',
          gender: 'M',
        };

        it('should create a result with number n°2 and patch the old n°2 to n°3', (done) => {
          Tags.patch(tags[2]._id, { assigned: true })
            .then(() => Runners.create(correctRunner3))
            .then(() => Times.create(correctTime3))
            .then(() => Results.find({ query: { 'tag.num': correctRunner3.tag.num, 'tag.color': correctRunner3.tag.color } }))
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].number).to.equal(2);
              return Results.find({ query: { 'tag.num': correctRunner2.tag.num, 'tag.color': correctRunner2.tag.color } });
            })
            .then((data) => {
              expect(data.data).to.exist;
              expect(data.data).to.be.lengthOf(1);
              expect(data.data[0].checkpoints_ids).to.include(99);
              expect(data.data[0].times).to.have.property(99);
              expect(data.data[0].times['99'].time).to.be.instanceof(Date);
              expect(data.data[0].number).to.equal(3);
              done();
            })
            .catch((err) => {
              if (err) { console.log(err); }
              expect.fail();
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
    // END WITH BEING AUTHENTICATED

    after((done) => {
      User.remove(null).then(() => Results.remove(null)).then(() => {
        done();
      });
    });
  });
  // END WITH REST
});
