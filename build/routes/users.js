'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Users = require('../models/Users');

var _Users2 = _interopRequireDefault(_Users);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (server) {
  server.route({
    path: '/users',
    method: 'POST',
    config: { auth: false },
    handler: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var _req$payload, email, password, confirmPassword, errors, user;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _req$payload = req.payload, email = _req$payload.email, password = _req$payload.password, confirmPassword = _req$payload.confirmPassword;
                errors = {};


                if (password !== confirmPassword) {
                  errors.password = _errors.UNMATCHED_PW;
                  errors.confirmPassword = _errors.UNMATCHED_PW;
                }

                if (!password) {
                  errors.password = _errors.BLANK;
                }

                if (!confirmPassword) {
                  errors.confirmPassword = _errors.BLANK;
                }

                // Check if email is duplicated
                _context.next = 7;
                return _Users2.default.findOne({ email: { $regex: new RegExp('^' + email + '$', 'i') } }).then(function (user) {
                  if (user) {
                    errors.email = _errors.NOT_UNIQUE;
                  }
                });

              case 7:

                if (!email) {
                  errors.email = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context.next = 12;
                  break;
                }

                user = new _Users2.default(req.payload);

                user.save();
                return _context.abrupt('return', res({
                  code: 200,
                  body: user
                }));

              case 12:
                return _context.abrupt('return', res({
                  code: 422,
                  errors: errors
                }));

              case 13:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function handler(_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  });
};