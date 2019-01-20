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
const Tags = app.service('tags');
chai.use(chaiHttp);

const URL = `http://${app.settings.host}:${app.settings.port}`;

const defaultTagsRange = { from: 1, to: 10, color: 'bleu' };

describe('tags service', () => {
  it('registered the tags service', () => {
    expect(app.service('tags')).to.be.ok;
  });

  describe('testing with REST', () => {
    before((done) => {
      User.create({
        email: 'admin@shouldexist.com',
        password: 'azerty9',
      }).then(() => {
        Tags.remove(null).then(() => {
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {
      it('should not create the tags (not logged in)', (done) => {
        chai.request(URL).post('/tags')
          .set('Accept', 'application/json')
          .send(defaultTagsRange)
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not find the tags (not logged in)', (done) => {
        chai.request(URL).get('/tags')
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the tag (not logged in)', (done) => {
        chai.request(URL).get(`/tags/${1}`)
          .set('Accept', 'application/json')
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a tag (not logged in)', (done) => {
        chai.request(URL).put(`/tags/${1}`)
          .set('Accept', 'application/json')
          .send({ num: 1, assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a tag (not logged in)', (done) => {
        chai.request(URL).patch(`/tags/${1}`)
          .set('Accept', 'application/json')
          .send({ assigned: true })
          // when finished
          .end((err, res) => {
            expect(res.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the tag (not logged in)', (done) => {
        chai.request(URL).delete(`/tags/${1}`)
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
      let tags;

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

      it('should create the tags', (done) => {
        chai.request(URL).post('/tags')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultTagsRange)
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.have.lengthOf(defaultTagsRange.to);
            expect(res.statusCode).to.equal(201);
            done();
          });
      });


      it('should find the tags', (done) => {
        chai.request(URL).get('/tags')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            tags = res.body.data;
            done();
          });
      });


      it('should get a tag', (done) => {
        chai.request(URL).get(`/tags/${tags[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body.num).to.exist;
            done();
          });
      });

      it('should update a tag', (done) => {
        const newTag = Object.assign({}, tags[0]);
        newTag.assigned = true;
        chai.request(URL).put(`/tags/${newTag._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newTag)
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.assigned).to.equal(newTag.assigned);
            done();
          });
      });

      it('should patch a tag', (done) => {
        chai.request(URL).patch(`/tags/${tags[1]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({ assigned: true })
          // when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.assigned).to.equal(true);
            done();
          });
      });

      it('should delete a tag', (done) => {
        chai.request(URL).delete(`/tags/${tags[0]._id}`)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          // when finished
          .end((err) => {
            expect(err).to.not.exist;
            done();
          });
      });
    });
    // END WITH BEING AUTHENTICATED

    after((done) => {
      User.remove(null).then(() => {
        Tags.remove(null).then(() => {
          done();
        });
      });
    });
  });
  // END WITH REST
});
