'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Professionals = require('../models/Professionals');

var _Professionals2 = _interopRequireDefault(_Professionals);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (server) {
  server.route({
    method: 'GET',
    path: '/professionals',
    handler: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var Professional;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                Professional = _Professionals2.default.byTenant(req.auth.credentials.id);
                _context.next = 3;
                return Professional.find().collation({ locale: 'en', strength: 2 }).sort({ name: 1 }).then(function (professionals) {
                  return res({
                    code: 200,
                    body: professionals
                  });
                }).catch(function () {
                  return res({
                    code: 500,
                    error: 'Could not fetch professionals'
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

  server.route({
    path: '/professionals',
    method: 'PUT',
    handler: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var Professional, _req$payload, name, id, errors, professional;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                Professional = _Professionals2.default.byTenant(req.auth.credentials.id);
                _req$payload = req.payload, name = _req$payload.name, id = _req$payload.id;
                errors = {};

                // Check if name is duplicated

                _context2.next = 5;
                return Professional.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }).then(function (professional) {
                  if (professional && professional._id.toString() !== id) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 5:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context2.next = 14;
                  break;
                }

                _context2.next = 9;
                return Professional.findById(id);

              case 9:
                professional = _context2.sent;

                professional.name = name;
                _context2.next = 13;
                return professional.save();

              case 13:
                return _context2.abrupt('return', res({
                  code: 200,
                  body: professional
                }));

              case 14:
                return _context2.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 15:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, undefined);
      }));

      return function handler(_x3, _x4) {
        return _ref2.apply(this, arguments);
      };
    }()
  });

  server.route({
    method: 'DELETE',
    path: '/professionals',
    handler: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
        var Professional;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                Professional = _Professionals2.default.byTenant(req.auth.credentials.id);
                _context3.next = 3;
                return Professional.findByIdAndRemove(req.payload).then(function () {
                  return res({
                    code: 204
                  });
                }).catch(function () {
                  return res({
                    code: 500
                  });
                });

              case 3:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      }));

      return function handler(_x5, _x6) {
        return _ref3.apply(this, arguments);
      };
    }()
  });

  server.route({
    path: '/professionals',
    method: 'POST',
    handler: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
        var Professional, name, errors, professional;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                Professional = _Professionals2.default.byTenant(req.auth.credentials.id);
                name = req.payload.name;
                errors = {};

                // Check if name is duplicated

                _context4.next = 5;
                return Professional.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }).then(function (professional) {
                  if (professional) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 5:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context4.next = 10;
                  break;
                }

                professional = new Professional(req.payload);

                professional.save();
                return _context4.abrupt('return', res({
                  code: 200,
                  body: professional
                }));

              case 10:
                return _context4.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 11:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      return function handler(_x7, _x8) {
        return _ref4.apply(this, arguments);
      };
    }()
  });
};