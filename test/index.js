/* eslint-env mocha */
const chai = require('chai')
const faker = require('faker')
const AV = require('leancloud-storage')
const _ = require('lodash')
const expect = chai.expect

const appId = 'fake_app_id'
const appKey = 'fake_app_key'

AV._config.APIServerURL = 'http://localhost:3000'

AV.init({
  appId,
  appKey
})

describe('FakeLeancloudAuth', () => {
  let app
  let fixture

  before(done => {
    app = require('../app')
    app.listen(3000, done)
    fixture = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      phone: faker.phone.phoneNumber('13#########'),
      email: faker.internet.email()
    }
  })

  it('should by default be null', () => {
    expect(AV.User.current()).to.equal(null)
  })

  it('should allow you to register', done => {
    AV.User.signUp(fixture.username, fixture.password, _.pick(fixture, ['email', 'phone'])).then(user => {
      if (user) {
        expect(user.isCurrent()).to.equal(true)
        expect(user.getUsername()).to.equal(fixture.username)
        done()
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })

  it('should allow you to logout', done => {
    AV.User.logOut().then(err => {
      if (err) {
        done(err)
      } else {
        expect(AV.User.current()).to.equal(null)
        done()
      }
    })
  })

  it('should allow you to login again', done => {
    AV.User.logIn(fixture.username, fixture.password).then(user => {
      if (user) {
        expect(user.authenticated()).to.equal(true)
        expect(user.getSessionToken()).to.be.not.empty
        expect(user.isCurrent()).to.equal(true)
        expect(user.getUsername()).to.equal(fixture.username)
        done()
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })

  it('should then allow you to call current user', done => {
    AV.User.currentAsync().then(user => {
      if (user) {
        expect(user.authenticated()).to.equal(true)
        expect(user.getSessionToken()).to.be.not.empty
        expect(user.isCurrent()).to.equal(true)
        expect(user.getUsername()).to.equal(fixture.username)
        done()
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })
})
