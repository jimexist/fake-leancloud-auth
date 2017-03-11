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

const ERR_USER_NOT_FOUND = {
  code: 211,
  error: 'Could not find user'
}

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

function registerUser (user, password) {
  return new Promise((resolve, reject) => {
    console.time('registerUser')
    User.register(user, password, (err, user) => {
      if (err) {
        reject(err)
      } else {
        console.timeEnd('registerUser')
        resolve(user)
      }
    })
  })
}

function setPassword (user, password) {
  return new Promise((resolve, reject) => {
    console.time('setPassword')
    user.setPassword(password, (err, user, passwordErr) => {
      if (err) {
        reject(passwordErr)
      } else if (user) {
        console.timeEnd('setPassword')
        resolve(user)
      }
    })
  })
}

api.route('/login')
  // https://github.com/leancloud/javascript-sdk/pull/347 now login uses POST
  .post(passport.authenticate('local'), (req, res) => {
    res.json(safeReturnUser(req))
  })

api.route('/users')
  .post(async (req, res, next) => {
    const { username, password, phone, email } = req.body
    try {
      const user = await registerUser(new User({
        username,
        phone,
        email
      }), password)
      res.location(`${req.baseUrl}${req.path}/${user.objectId}`)
        .status(201)
        .json(safeReturnUser(req, user))
    } catch (err) {
      res.status(400).send(err.message)
    }
  })

api.route('/users/me')
  .get((req, res, next) => {
    const sessionToken = req.get('X-LC-Session')
    if (_.isEmpty(sessionToken)) {
      return res.status(400).send('Session token must be set')
    }
    // this is an undocumented API thus a hack - in order to pull the store
    const { sessionStore } = req
    console.time('getMe')
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
        console.timeEnd('getMe')
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

api.route('/users/:userId([0-9a-fA-F]{24}$)')
  .get(async (req, res, next) => {
    const { userId } = req.params
    try {
      console.time('findById')
      const user = await User.findById(userId)
      if (user) {
        console.timeEnd('findById')
        res.json(safeReturnUser(req, user, null))
      } else {
        res.status(404).json(ERR_USER_NOT_FOUND)
      }
    } catch (error) {
      res.status(400).send(error.message)
    }
  })
  .put(async (req, res, next) => {
    const { userId } = req.params
    const keysCount = _.keys(req.body).length
    const hasPassword = _.has(req.body, 'password')
    if (keysCount > 0 && !hasPassword) {
      try {
        const user = await User.findByIdAndUpdate(userId, req.body)
        if (user) {
          const { updatedAt } = user
          res.json({ updatedAt })
        } else {
          res.status(400).json(ERR_USER_NOT_FOUND)
        }
      } catch (err) {
        res.status(400).send(err.message)
      }
    } else if (keysCount === 1 && hasPassword) {
      try {
        const user = await User.findById(userId)
        if (user) {
          const updateInfo = await setPassword(user, req.body.password)
          const { hash, salt } = updateInfo
          const updatedUser = await User.findByIdAndUpdate(userId, { hash, salt })
          const { updatedAt } = updatedUser
          res.json({ updatedAt })
        } else {
          res.status(404).json(ERR_USER_NOT_FOUND)
        }
      } catch (err) {
        res.status(400).send(err.message)
      }
    } else {
      res.sendStatus(400)
    }
  })

api.route('/classes/_User/:userId([0-9a-fA-F]{24}$)')
  .put(async (req, res, next) => {
    const { userId } = req.params
    const { turbineUserId } = req.body
    // we only allow for updating turbine user id
    try {
      console.time('putById')
      const user = await User.findByIdAndUpdate(userId, { turbineUserId })
      if (user) {
        console.timeEnd('putById')
        res.json(safeReturnUser(req, user, null))
      } else {
        res.status(404).json(ERR_USER_NOT_FOUND)
      }
    } catch (err) {
      res.status(400).send(err.message)
    }
  })

module.exports = api
