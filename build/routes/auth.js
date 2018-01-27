'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jwtSimple = require('jwt-simple');

var _jwtSimple2 = _interopRequireDefault(_jwtSimple);

var _Users = require('../models/Users');

var _Users2 = _interopRequireDefault(_Users);

var _auth = require('../auth');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (server) {
  server.route({
    method: 'POST',
    path: '/token',
    config: { auth: false },
    handler: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var _req$payload, email, password;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _req$payload = req.payload, email = _req$payload.email, password = _req$payload.password;
                _context.next = 3;
                return _Users2.default.findOne({ email: email }).then(function (user) {
                  if (user && user.isPassCorrect(password, user.password)) {
                    var payload = { id: user._id };
                    return res({
                      code: 200,
                      body: _jwtSimple2.default.encode(payload, _auth.jwtSecret)
                    });
                  }
                  return res({ code: 401 });
                }).catch(function () {
                  return res({
                    code: 500,
                    error: 'Could not do this request for a token'
                  });
                });

              case 3:
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