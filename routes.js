const express = require('express')
const _ = require('lodash')
const passport = require('passport')
const User = require('./models/user')

const api = express.Router()

const userFields = [
  'username',
  'objectId',
  'createdAt',
  'updatedAt',
  'email',
  'phone',
  'emailVerified',
  'mobilePhoneVerified',
  'turbineUserId'
]

function safeReturnUser (req, user = req.user, sessionToken = req.sessionID) {
  if (_.isEmpty(user)) {
    return user
  }
  let val = _.chain(user).pick(userFields)
  if (sessionToken) {
    val = val.set('sessionToken', sessionToken)
  }
  return val.value()
}

api.route('/login')
  // https://github.com/leancloud/javascript-sdk/pull/347 now login uses POST
  .post(passport.authenticate('local'), (req, res) => {
    res.json(safeReturnUser(req))
  })

api.route('/users')
  .post((req, res, next) => {
    const { username, password, phone, email } = req.body
    User.register(new User({
      username,
      password,
      phone,
      email
    }), password, (err, user) => {
      if (err) {
        res.status(400).send(err.message)
      } else {
        res.location(`${req.baseUrl}${req.path}/${user.objectId}`)
          .status(201)
          .json(safeReturnUser(req, user))
      }
    })
  })

api.route('/users/me')
  .get((req, res, next) => {
    const sessionToken = req.get('X-LC-Session')
    if (_.isEmpty(sessionToken)) {
      return res.status(400).send('Session token must be set')
    }
    // this is an undocumented API thus a hack - in order to pull the store
    const { sessionStore } = req
    sessionStore.get(sessionToken, (err, session) => {
      if (err) {
        return res.status(400).send(err.message)
      }
      const username = _.get(session, 'passport.user')
      if (_.isEmpty(username)) {
        return res.status(401).send('Unauthorized.')
      }
      User.findByUsername(username, (err, user) => {
        if (err) {
          return next(err)
        }
        if (_.isEmpty(user)) {
          return res.status(404).json({
            code: 211,
            error: 'Could not find user'
          })
        }
        return res.json(safeReturnUser(null, user, sessionToken))
      })
    })
  })

const ERR_USER_NOT_FOUND = {
  code: 211,
  error: 'Could not find user'
}

api.route('/users/:userId([0-9a-fA-F]{24}$)')
  .get((req, res, next) => {
    const { userId } = req.params
    User.findById(userId, (err, user) => {
      if (err) {
        res.status(400).send(err.message)
      } else if (user) {
        res.json(safeReturnUser(req, user, null))
      } else {
        return res.status(404).json(ERR_USER_NOT_FOUND)
      }
    })
  })

api.route('/classes/_User/:userId([0-9a-fA-F]{24}$)')
  .put((req, res, next) => {
    const { userId } = req.params
    const { turbineUserId } = req.body
    // we only allow for updating turbine user id
    User.findByIdAndUpdate(userId, { turbineUserId }, (err, user) => {
      if (err) {
        res.status(400).send(err.message)
      } else if (user) {
        res.json(safeReturnUser(req, user, null))
      } else {
        return res.status(404).json(ERR_USER_NOT_FOUND)
      }
    })
  })

module.exports = api
