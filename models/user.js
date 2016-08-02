const mongoose = require('mongoose')
const Schema = mongoose.Schema
const isEmail = require('validator/lib/isEmail')
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
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  mobilePhoneVerified: {
    type: Boolean,
    default: false
  }
})

User.plugin(passportLocalMongoose, {
  usernameQueryFields: ['objectId', 'email']
})

module.exports = mongoose.model('User', User)
