require('babel-polyfill')
const express = require('express')
const passport = require('passport')
const bodyParser = require('body-parser')
const session = require('express-session')
const mongoose = require('mongoose')
const morgan = require('morgan')
const connectMongo = require('connect-mongo')
const User = require('./models/user')
const { ensureAppHeaders } = require('./middlewares/ensureHeaders')
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/local'

mongoose.Promise = global.Promise

const app = express()

app.use(morgan(process.env.NODE_ENV === 'prod' ? 'combined' : 'dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const MongoSessionStore = connectMongo(session)
app.use(session({
  secret: process.env.SESSION_SECRET || 'b77cb93f19d72207a8b2442949257128',
  resave: false,
  saveUninitialized: true,
  store: new MongoSessionStore({
    url: mongoUrl
  })
}))

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(passport.initialize())
app.use(passport.session())

if (process.env.NODE_ENV === 'prod') {
  app.use(require('helmet')())
}

mongoose.connect(mongoUrl, err => {
  if (err) {
    console.error('failed to connect to mongo', err)
    process.exit(-1)
  } else {
    console.log('successfully connected to mongo at', mongoUrl)
  }
})

app.get('/version', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    version: process.env.npm_package_version
  })
})

app.use('/1.1', ensureAppHeaders, require('./routes'))

module.exports = app
