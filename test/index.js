/* eslint-env mocha */
require('babel-polyfill')
const chai = require('chai')
const faker = require('faker')
const AV = require('leancloud-storage')
const _ = require('lodash')
const fetch = require('node-fetch')
const morgan = require('morgan')
const assert = chai.assert

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
    app = require('../src/app')
    app.use(morgan('dev'))
    app.listen(3000, done)
    fixture = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
      phone: faker.phone.phoneNumber('13#########'),
      email: faker.internet.email(),
      turbineUserId: faker.internet.userName(),
      spareUsername: faker.internet.userName(),
      sparePassword: faker.internet.password(),
      sparePhone: faker.phone.phoneNumber('13#########'),
      spareEmail: faker.internet.email()
    }
  })

  it('should by default be null', () => {
    assert.isNull(AV.User.current())
  })

  it('should allow you to register', done => {
    AV.User.signUp(fixture.username, fixture.password, _.pick(fixture, ['email', 'phone'])).then(user => {
      if (user) {
        assert.isTrue(user.isCurrent())
        assert.equal(user.getUsername(), fixture.username)
        assert.equal(user.getEmail(), fixture.email)
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
        assert.isNull(AV.User.current())
        done()
      }
    })
  })

  it('should allow you to login again', done => {
    AV.User.logIn(fixture.username, fixture.password).then(user => {
      if (user) {
        user.isAuthenticated().then(result => {
          assert.isTrue(result)
          assert.isString(user.getSessionToken())
          assert.equal(user.isCurrent(), true)
          assert.equal(user.getUsername(), fixture.username)
          assert.equal(user.getEmail(), fixture.email)
          done()
        }).catch(err => done(err))
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })

  it('should then allow you to call current user', done => {
    AV.User.currentAsync().then(user => {
      if (user) {
        user.isAuthenticated().then(value => {
          assert.isTrue(value)
          assert.isNotNull(user.getSessionToken())
          assert.isTrue(user.isCurrent())
          assert.equal(user.getUsername(), fixture.username)
          assert.equal(user.getEmail(), fixture.email)
          done()
        }).catch(err => done(err))
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })

  it('should allow you to set custom field', done => {
    AV.User.logIn(fixture.username, fixture.password).then(user => {
      if (user) {
        user.set('turbineUserId', fixture.turbineUserId)
        user.save().then(updatedUser => {
          assert.equal(updatedUser.get('turbineUserId'), fixture.turbineUserId)
          done()
        }).catch(err => done(err))
      } else {
        done(new Error('empty user'))
      }
    }).catch(err => done(err))
  })

  it('should allow you to update other fields including username', (done) => {
    const {
      password,
      sparePhone,
      spareEmail,
      spareUsername
    } = fixture
    const headers = {
      'X-LC-Id': 'x-lc-id',
      'X-LC-Key': 'x-lc-key',
      'X-LC-Session': 'x-lc-session',
      'Content-Type': 'application/json'
    }
    AV.User.currentAsync().then(user => {
      if (user) {
        const objectId = user.getObjectId()
        fetch(`http://localhost:3000/1.1/users/${objectId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            phone: sparePhone,
            email: spareEmail,
            username: spareUsername
          })
        })
        .then(res => res.json())
        .then(info => {
          assert.property(info, 'updatedAt')
          AV.User.logIn(spareUsername, password).then(user => {
            const newEmail = user.getEmail()
            const newPhone = user.get('phone')
            const newUsername = user.getUsername()
            assert.equal(newEmail, spareEmail)
            assert.equal(newPhone, sparePhone)
            assert.equal(newUsername, spareUsername)
            done()
          })
        })
      }
    })
  })

  it('should allow you to update password', (done) => {
    const {
      spareUsername,
      sparePassword
    } = fixture
    const headers = {
      'X-LC-Id': 'x-lc-id',
      'X-LC-Key': 'x-lc-key',
      'X-LC-Session': 'x-lc-session',
      'Content-Type': 'application/json'
    }
    AV.User.currentAsync().then(user => {
      if (user) {
        const objectId = user.getObjectId()
        fetch(`http://localhost:3000/1.1/users/${objectId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            password: sparePassword
          })
        })
        .then(res => res.json())
        .then(info => {
          assert.property(info, 'updatedAt')
          AV.User.logIn(spareUsername, sparePassword).then(user => {
            assert.isObject(user)
            done()
          })
        })
      }
    })
  })
})
