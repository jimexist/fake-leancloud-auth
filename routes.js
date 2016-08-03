const express = require('express')
const _ = require('lodash')
const passport = require('passport')
const User = require('./models/user')

const api = express.Router()

const urlBase = '' // we do not use this

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
        res.set('Location', `${urlBase}/1.1/users/${user.objectId}`)
          .status(201)
          .json(safeReturnUser(req, user))
      }
    })
  })

api.route('/users/me')
  .get((req, res) => {
    res.json(safeReturnUser(req))
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
