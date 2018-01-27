'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

require('isomorphic-fetch');

var _Purchases = require('../../models/Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Products = require('../../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _Stock = require('../../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Purchases3 = require('../../controllers/Purchases');

var _Purchases4 = _interopRequireDefault(_Purchases3);

var _configureServer = require('../../configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

var _errors = require('../../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* global fetch */


var PURCHASES_URL = 'http://localhost:5001/purchases';
var server = void 0;

var genericErrorHandler = function genericErrorHandler(err) {
  if (err) {
    throw new Error(err);
  }
};

describe('Purchases Route', function () {
  var ox = void 0;
  var shampoo = void 0;

  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _configureServer2.default)().then(function (sv) {
              sv.start();
              return sv;
            });

          case 2:
            server = _context.sent;
            _context.next = 5;
            return _Purchases2.default.deleteMany({}, genericErrorHandler);

          case 5:
            _context.next = 7;
            return _Stock2.default.deleteMany({}, genericErrorHandler);

          case 7:
            _context.next = 9;
            return _Products2.default.deleteMany({}, genericErrorHandler);

          case 9:

            ox = new _Products2.default({ name: 'OX', measure_unit: 'ml' });
            _context.next = 12;
            return ox.save();

          case 12:

            shampoo = new _Products2.default({ name: 'shampoo', measure_unit: 'ml' });
            _context.next = 15;
            return shampoo.save();

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  afterEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return server.stop();

          case 2:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  describe('GET Route', function () {
    it('receives an empty array when no purchases', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var answer;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return fetch(PURCHASES_URL).then(function (res) {
                return res.json();
              });

            case 2:
              answer = _context3.sent;


              expect(answer).toEqual({
                code: 200,
                body: []
              });

            case 4:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));

    it('receives a list of purchases', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var postBody, purchasesController, answer;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // Prepare
              postBody = {
                products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: ox._id, qty: 1000, total_price: 40 }],
                seller: 'Company one',
                date: Date.now()
              };
              purchasesController = new _Purchases4.default();
              _context4.next = 4;
              return purchasesController.create(postBody);

            case 4:
              _context4.next = 6;
              return fetch(PURCHASES_URL).then(function (res) {
                return res.json();
              });

            case 6:
              answer = _context4.sent;


              // Assert
              expect(answer.body[0].stockEntries[0].product.name).toEqual(ox.name);

            case 8:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));
  });

  describe('POST Route', function () {
    it('Can post a purchase', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var beforeList, postBody, res;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _Purchases2.default.find(function (err, purchases) {
                return purchases;
              });

            case 2:
              beforeList = _context5.sent;

              expect(beforeList.length).toBe(0);

              postBody = {
                products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: ox._id, qty: 1000, total_price: 40 }],
                seller: 'Company one',
                date: Date.now()
              };
              _context5.next = 7;
              return fetch(PURCHASES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (resp) {
                return resp.json();
              });

            case 7:
              res = _context5.sent;


              // console.log(res.body);
              expect(res.code).toEqual(200);
              expect(res.body.seller).toEqual('Company one');
              expect(res.body.price).toEqual(130);
              expect(_typeof(res.body.stockEntries[0].id)).toEqual('string');
              expect(res.body.stockEntries[0].product.name).toEqual(ox.name);

            case 13:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    it('responds with errors in case there is', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var postBody, expectedErrors, res;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              postBody = {
                products: [{ id: undefined, qty: undefined, total_price: 0 }, { id: ox._id, qty: 1000, total_price: undefined }],
                seller: undefined,
                date: ''
              };
              expectedErrors = {
                seller: _errors.BLANK,
                date: _errors.BLANK,
                products: [{
                  id: _errors.BLANK,
                  qty: _errors.NOT_POSITIVE,
                  total_price: _errors.NOT_POSITIVE
                }, {
                  id: undefined,
                  qty: undefined,
                  total_price: _errors.NOT_POSITIVE
                }]
              };
              _context6.next = 4;
              return fetch(PURCHASES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (resp) {
                return resp.json();
              });

            case 4:
              res = _context6.sent;


              expect(res.code).toEqual(422);
              expect(res.errors).toEqual(expectedErrors);

            case 7:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });

  afterAll(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
    return regeneratorRuntime.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _context7.next = 2;
            return _Purchases2.default.deleteMany({}, genericErrorHandler);

          case 2:
            _context7.next = 4;
            return _Products2.default.deleteMany({}, genericErrorHandler);

          case 4:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, undefined);
  })));
});