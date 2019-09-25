var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
const secret = 'rubicamp';

var userSchema = new Schema({
  email: String,
  password: String,
  fullname: String,
  token: String
});

userSchema.pre('save', function(next) {
  let user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, saltRounds, function(err, hash) {
    if(err) return next(err)
    user.password = hash;
    user.token = user.generateToken();
    next()
  });
});

userSchema.methods.comparePassword = function(plainPassword, done) {
  bcrypt.compare(plainPassword, this.password).then(function(res) {
    done(res);
  });
};

userSchema.methods.generateToken = function() {
  let user = this;
  delete user.password;
  let token = jwt.sign({email: user.email}, secret);
  console.log(token);
  return token;
};

userSchema.statics.decodeToken = function(token) {
  return jwt.verify(token, secret);
};

module.exports = mongoose.model('User', userSchema);
