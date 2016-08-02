const express = require('express')
const morgan = require('morgan')

const app = express()

app.use(morgan(process.env.NODE_ENV === 'prod' ? 'combined' : 'dev'))

if (process.env.NODE_ENV === 'prod') {
  app.use(require('helmet')())
}

app.get('/version', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    version: process.env.npm_package_version
  })
})

const api = express.Router()

api.route('/login')
  .get((req, res) => {
    const { username, password } = req.query
    res.json({
      username,
      password
    })
  })

api.route('/users')
  .get((req, res) => {
    res.json({
      status: 'ok'
    })
  })
  .post((req, res) => {
    const { username, password, phone } = req.query
    console.log(username, password, phone)
    res.sendStatus(201)
  })

api.route('/users/:userId')
  .get((req, res) => {
    const userId = req.params.userId
    res.json({
      userId
    })
  })
  .delete((req, res) => {
    const userId = req.params.userId
    res.json({
      userId,
      deleted: true
    })
  })

app.use('/1.1', api)

app.listen(3000, '0.0.0.0', err => {
  if (err) {
    console.error('error happened', err)
    process.exit(-1)
  } else {
    console.log('started and listening at', '0.0.0.0:3000')
  }
})
