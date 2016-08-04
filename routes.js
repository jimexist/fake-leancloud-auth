const express = require('express')
const _ = require('lodash')
const passport = require('passport')
const User = require('./models/user')
const { ensureAuthHeaders } = require('./middlewares/ensureHeaders')

const api = express.Router()

const userFields = [
  'username',
  'objectId',
  'createdAt',
  'updatedAt',
  'phone',
  'emailVerified',
  'mobilePhoneVerified'
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
  .get(passport.authenticate('local'), (req, res) => {
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
  .get(ensureAuthHeaders, (req, res, next) => {
    // TODO - get session object from session store
    const username = _.get(req, 'session.passport.user')
    console.log('username', username)
    if (username) {
      User.findByUsername(username, (err, user) => {
        if (err) {
          return next(err)
        }
        if (user) {
          res.json(safeReturnUser(req, user))
        } else {
          res.json({
            code: 211,
            error: 'Could not find user'
          })
        }
      })
    } else {
      res.sendStatus(401)
    }
  })

api.route('/users/:userId([0-9a-fA-F]{24}$)')
  .get((req, res, next) => {
    const { userId } = req.params
    User.findById(userId, (err, user) => {
      if (err) {
        res.status(400).send(err.message)
      } else if (user) {
        res.json(safeReturnUser(req, user, null))
      } else {
        res.sendStatus(404)
      }
    })
  })

module.exports = api
