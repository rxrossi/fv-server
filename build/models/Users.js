'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;


var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
});

userSchema.pre('save', function (next) {
  var user = this;

  var salt = _bcrypt2.default.genSaltSync();

  user.set('password', _bcrypt2.default.hashSync(user.password, salt));

  next();
});

userSchema.methods.isPassCorrect = function (candidatePassword, password) {
  return _bcrypt2.default.compareSync(candidatePassword, password);
};

exports.default = _mongoose2.default.model('User', userSchema);