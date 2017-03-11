const mongoose = require('mongoose')
const Schema = mongoose.Schema
const isEmail = require('validator/lib/isEmail')
const isNumeric = require('validator/lib/isNumeric')
const passportLocalMongoose = require('passport-local-mongoose')

mongoose.Promise = Promise

const User = new Schema({
  email: {
    type: String,
    required: true,
    validate: {
      validator: isEmail
    },
    message: '{VALUE} 不是一个合法的 email 地址'
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: isNumeric
    }
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  mobilePhoneVerified: {
    type: Boolean,
    default: false
  },
  turbineUserId: {
    type: String
  }
}, {
  timestamps: true
})
User.pre('init', function (next) {
  console.time('init')
  next()
})
User.pre('validate', function (next) {
  console.time('validate')
  next()
})
User.pre('save', function (next) {
  console.time('save')
  next()
})
User.pre('remove', function (next) {
  console.time('remove')
  next()
})
User.post('init', function () {
  console.timeEnd('init')
})
User.post('validate', function () {
  console.timeEnd('validate')
})
User.post('save', function () {
  console.timeEnd('save')
})
User.post('remove', function () {
  console.timeEnd('remove')
})

User.virtual('objectId').get(function () {
  return this._id
})

const fields = {
  objectId: 1,
  username: 1,
  email: 1,
  phone: 1,
  turbineUserId: 1
}

User.plugin(passportLocalMongoose, {
  iterations: 1000,
  usernameField: 'username',
  usernameUnique: true,
  usernameQueryFields: ['objectId', 'email'],
  selectFields: fields
})

module.exports = mongoose.model('User', User)
