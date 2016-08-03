const mongoose = require('mongoose')
const Schema = mongoose.Schema
const isEmail = require('validator/lib/isEmail')
const isNumeric = require('validator/lib/isNumeric')
const passportLocalMongoose = require('passport-local-mongoose')

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
    required: true
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
  }
}, {
  timestamps: true
})

User.plugin(passportLocalMongoose, {
  usernameField: 'username',
  usernameUnique: true,
  usernameQueryFields: ['objectId', 'email']
})

module.exports = mongoose.model('User', User)
