'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _configureServer = require('./configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _configureServer2.default)().then(function (server) {
  return server.start();
}).then(function () {
  return console.log('Server running');
});

exports.default = _configureServer2.default;