'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Clients = require('../models/Clients');

var _Clients2 = _interopRequireDefault(_Clients);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (server) {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var Client;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                Client = _Clients2.default.byTenant(req.auth.credentials.id);
                _context.next = 3;
                return Client.find().collation({ locale: 'en', strength: 2 }).sort({ name: 1 }).then(function (clients) {
                  return res({
                    code: 200,
                    body: clients
                  });
                }).catch(function () {
                  return res({
                    code: 500,
                    error: 'Could not fetch clients'
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
    method: 'DELETE',
    path: '/clients',
    handler: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var Client;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                Client = _Clients2.default.byTenant(req.auth.credentials.id);
                _context2.next = 3;
                return Client.findByIdAndRemove(req.payload).then(function () {
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
    path: '/clients',
    method: 'PUT',
    handler: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
        var Client, _req$payload, name, phone, id, errors, client;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                Client = _Clients2.default.byTenant(req.auth.credentials.id);
                _req$payload = req.payload, name = _req$payload.name, phone = _req$payload.phone, id = _req$payload.id;
                errors = {};


                if (!phone) {
                  errors.phone = _errors.BLANK;
                }

                // Check if name is duplicated
                _context3.next = 6;
                return Client.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }).then(function (client) {
                  if (client && client._id.toString() !== id) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 6:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context3.next = 16;
                  break;
                }

                _context3.next = 10;
                return Client.findById(id);

              case 10:
                client = _context3.sent;

                client.name = name;
                client.phone = phone;
                _context3.next = 15;
                return client.save();

              case 15:
                return _context3.abrupt('return', res({
                  code: 200,
                  body: client
                }));

              case 16:
                return _context3.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 17:
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
    path: '/clients',
    method: 'POST',
    handler: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
        var Client, _req$payload2, name, phone, errors, client;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                Client = _Clients2.default.byTenant(req.auth.credentials.id);
                _req$payload2 = req.payload, name = _req$payload2.name, phone = _req$payload2.phone;
                errors = {};


                if (!phone) {
                  errors.phone = _errors.BLANK;
                }

                // Check if name is duplicated
                _context4.next = 6;
                return Client.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } }).then(function (client) {
                  if (client) {
                    errors.name = _errors.NOT_UNIQUE;
                  }
                });

              case 6:

                if (!name) {
                  errors.name = _errors.BLANK;
                }

                if (Object.keys(errors).length) {
                  _context4.next = 11;
                  break;
                }

                client = new Client(req.payload);

                client.save();
                return _context4.abrupt('return', res({
                  code: 200,
                  body: client
                }));

              case 11:
                return _context4.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 12:
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