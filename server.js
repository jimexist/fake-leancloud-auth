const app = require('./app')

app.listen(3000, '0.0.0.0', err => {
  if (err) {
    console.error('error happened', err)
    process.exit(-1)
  } else {
    console.log('started and listening at', '0.0.0.0:3000')
  }
})
