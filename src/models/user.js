const mongoose = require('mongoose')
mongoose.Promise = global.Promise
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
  selectFields: fields
})

module.exports = mongoose.model('User', User)
