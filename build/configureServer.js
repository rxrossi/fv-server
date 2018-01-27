'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hapi = require('hapi');

var _hapi2 = _interopRequireDefault(_hapi);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _hapiCorsHeaders = require('hapi-cors-headers');

var _hapiCorsHeaders2 = _interopRequireDefault(_hapiCorsHeaders);

var _products = require('./routes/products');

var _products2 = _interopRequireDefault(_products);

var _clients = require('./routes/clients');

var _clients2 = _interopRequireDefault(_clients);

var _professionals = require('./routes/professionals');

var _professionals2 = _interopRequireDefault(_professionals);

var _purchases = require('./routes/purchases');

var _purchases2 = _interopRequireDefault(_purchases);

var _sales = require('./routes/sales');

var _sales2 = _interopRequireDefault(_sales);

var _users = require('./routes/users');

var _users2 = _interopRequireDefault(_users);

var _auth = require('./routes/auth');

var _auth2 = _interopRequireDefault(_auth);

var _auth3 = require('./auth');

var _auth4 = _interopRequireDefault(_auth3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var server, port, mongodbURL;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          server = new _hapi2.default.Server();
          port = process.env.PORT || 5001;
          _context.next = 4;
          return server.connection({
            host: 'localhost',
            port: port
          });

        case 4:

          server.ext('onPreResponse', _hapiCorsHeaders2.default);

          _mongoose2.default.Promise = global.Promise;

          (0, _auth4.default)(server);
          (0, _clients2.default)(server);
          (0, _products2.default)(server);
          (0, _professionals2.default)(server);
          (0, _purchases2.default)(server);
          (0, _sales2.default)(server);
          (0, _users2.default)(server);
          (0, _auth2.default)(server);

          _mongoose2.default.Promise = global.Promise;

          mongodbURL = process.env.MONGODB_URI || 'mongodb://localhost/fv2';
          return _context.abrupt('return', _mongoose2.default.connect(mongodbURL, { useMongoClient: true }).then(function () {
            return server;
          }));

        case 17:
        case 'end':
          return _context.stop();
      }
    }
  }, _callee, undefined);
}));