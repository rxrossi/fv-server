'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jwtSecret = undefined;

var _hapiAuthJwt = require('hapi-auth-jwt2');

var _hapiAuthJwt2 = _interopRequireDefault(_hapiAuthJwt);

var _Users = require('./models/Users');

var _Users2 = _interopRequireDefault(_Users);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var jwtSecret = exports.jwtSecret = process.env.JWT_SECRET || 'a-Random_string_anything';

function validate(decoded, request, callback) {
  _Users2.default.findById(decoded.id).then(function (user) {
    if (user) {
      return callback(null, true);
    }
    return callback(null, false);
  });
}

exports.default = function (server) {
  server.register(_hapiAuthJwt2.default, function (err) {
    if (err) {
      throw err;
    }

    server.auth.strategy('jwt', 'jwt', true, {
      key: jwtSecret,
      validateFunc: validate,
      verifyOptions: { algorithms: ['HS256'] }
    });
  });
};