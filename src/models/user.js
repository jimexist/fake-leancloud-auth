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
  usernameField: 'username',
  usernameUnique: true,
  usernameQueryFields: ['objectId', 'email'],
  selectFields: fields,
  // not a good idea for production system but here we are using it for test
  // so setting this value to be 1000
  iterations: process.env.PBK_HK2_ITERATIONS || 1000
})

module.exports = mongoose.model('User', User)
