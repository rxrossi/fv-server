'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Products = require('../controllers/Products');

var _Products2 = _interopRequireDefault(_Products);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function (server) {
  server.route({
    method: 'GET',
    path: '/products',
    handler: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
        var controller;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                controller = new _Products2.default(req.auth.credentials.id);
                _context.t0 = res;
                _context.next = 4;
                return controller.getAll();

              case 4:
                _context.t1 = _context.sent;
                _context.t2 = {
                  code: 200,
                  body: _context.t1
                };
                (0, _context.t0)(_context.t2);

              case 7:
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
    path: '/products',
    method: 'PUT',
    handler: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, res) {
        var controller, _ref3, product, errors;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                controller = new _Products2.default(req.auth.credentials.id);
                _context2.next = 3;
                return controller.update(req.payload);

              case 3:
                _ref3 = _context2.sent;
                product = _ref3.product;
                errors = _ref3.errors;

                if (!errors) {
                  _context2.next = 8;
                  break;
                }

                return _context2.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 8:
                return _context2.abrupt('return', res({
                  code: 200,
                  body: product
                }));

              case 9:
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
    path: '/products',
    method: 'DELETE',
    handler: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(req, res) {
        var controller, _ref5, errors;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                controller = new _Products2.default(req.auth.credentials.id);
                _context3.next = 3;
                return controller.delete(req.payload);

              case 3:
                _ref5 = _context3.sent;
                errors = _ref5.errors;

                if (!errors) {
                  _context3.next = 7;
                  break;
                }

                return _context3.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 7:
                return _context3.abrupt('return', res({
                  code: 204
                }));

              case 8:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, undefined);
      }));

      return function handler(_x5, _x6) {
        return _ref4.apply(this, arguments);
      };
    }()
  });

  server.route({
    path: '/products',
    method: 'POST',
    handler: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(req, res) {
        var controller, _ref7, product, errors;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                controller = new _Products2.default(req.auth.credentials.id);
                _context4.next = 3;
                return controller.create(req.payload);

              case 3:
                _ref7 = _context4.sent;
                product = _ref7.product;
                errors = _ref7.errors;

                if (!errors) {
                  _context4.next = 8;
                  break;
                }

                return _context4.abrupt('return', res({
                  code: 422, // 409 is conflict
                  errors: errors
                }));

              case 8:
                return _context4.abrupt('return', res({
                  code: 200,
                  body: product
                }));

              case 9:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      return function handler(_x7, _x8) {
        return _ref6.apply(this, arguments);
      };
    }()
  });
};