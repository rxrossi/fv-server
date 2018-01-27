'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('isomorphic-fetch');

var _Products = require('../../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _Clients = require('../../models/Clients');

var _Clients2 = _interopRequireDefault(_Clients);

var _Professionals = require('../../models/Professionals');

var _Professionals2 = _interopRequireDefault(_Professionals);

var _Sales = require('../../controllers/Sales');

var _Sales2 = _interopRequireDefault(_Sales);

var _Sales3 = require('../../models/Sales');

var _Sales4 = _interopRequireDefault(_Sales3);

var _Purchases = require('../../controllers/Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Stock = require('../../controllers/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Stock3 = require('../../models/Stock');

var _Stock4 = _interopRequireDefault(_Stock3);

var _configureServer = require('../../configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

var _errors = require('../../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* global fetch */


var stock = new _Stock2.default();

var PRODUCTS_URL = 'http://localhost:5001/products';
var server = void 0;

describe('Products Route', function () {
  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return (0, _configureServer2.default)().then(function (server) {
              server.start();
              return server;
            });

          case 2:
            server = _context.sent;

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  })));

  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return _Professionals2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not ProfessionalModel.deleteMany on DB';
              }
            });

          case 2:
            _context2.next = 4;
            return _Stock4.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not StockModel.deleteMany on DB';
              }
            });

          case 4:
            _context2.next = 6;
            return _Clients2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not ProfessionalModel.deleteMany on DB';
              }
            });

          case 6:
            _context2.next = 8;
            return _Products2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not Product.deleteMany on DB';
              }
            });

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  afterEach(function (done) {
    server.stop().then(function () {
      return done();
    });
  });

  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return _Professionals2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not ProfessionalModel.deleteMany on DB';
              }
            });

          case 2:
            _context3.next = 4;
            return _Stock4.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not StockModel.deleteMany on DB';
              }
            });

          case 4:
            _context3.next = 6;
            return _Sales4.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not SalesModel.deleteMany on DB';
              }
            });

          case 6:
            _context3.next = 8;
            return _Clients2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not ProfessionalModel.deleteMany on DB';
              }
            });

          case 8:
            _context3.next = 10;
            return _Products2.default.deleteMany({}, function (err) {
              if (err) {
                throw 'Could not Product.deleteMany on DB';
              }
            });

          case 10:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  describe('GET Route', function () {
    it('receives an empty array when no products', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var answer;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return fetch(PRODUCTS_URL).then(function (res) {
                return res.json();
              });

            case 2:
              answer = _context4.sent;


              expect(answer).toEqual({
                code: 200,
                body: []
              });

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));

    it('receives a list of products where stock is a empty list, entries on it does not exist yet ', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var productsList, expected, answer;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              productsList = [{ name: 'OX', measure_unit: 'ml' }, { name: 'Shampoo', measure_unit: 'ml' }, { name: 'Capes', measure_unit: 'unit' }];
              expected = [_extends({}, productsList[0], {
                quantity: 0,
                price: '',
                avgPriceFiveLast: '',
                stock: []
              }), _extends({}, productsList[1], {
                quantity: 0,
                price: '',
                avgPriceFiveLast: '',
                stock: []
              }), _extends({}, productsList[2], {
                quantity: 0,
                price: '',
                avgPriceFiveLast: '',
                stock: []
              })];
              _context5.next = 4;
              return _Products2.default.collection.insert(productsList, function (err) {
                if (err) {
                  console.log(err);
                }
              });

            case 4:
              _context5.next = 6;
              return fetch(PRODUCTS_URL).then(function (res) {
                return res.json();
              });

            case 6:
              answer = _context5.sent;


              expect(answer.code).toEqual(200);
              expect(answer.body.length).toEqual(3);
              expect(answer.body[0].name).toEqual(expected[2].name);
              expect(answer.body[0].measure_unit).toEqual(expected[2].measure_unit);
              expect(answer.body[0].quantity).toEqual(expected[2].quantity);
              expect(answer.body[0].price).toEqual(expected[2].price);
              expect(answer.body[0].avgPriceFiveLast).toEqual(expected[2].avgPriceFiveLast);

            case 14:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    it('sends a a list of products with valid stock when entries exist', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var ox, client1, professional1, purchase, purchasesController, _ref7, savedPurchase, sale, saleController, _ref8, savedSale, stockController, stockEntries, answer, expectedSourceOrDestinationOfPurchase;

      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              ox = new _Products2.default({ name: 'OX', measure_unit: 'ml' });

              ox.save();

              client1 = new _Clients2.default({ name: 'Mary', phone: '999' });

              client1.save();

              professional1 = new _Professionals2.default({ name: 'Carl' });

              professional1.save();

              purchase = {
                products: [{ id: ox._id, qty: 1000, total_price: 100 }],
                seller: 'Company one',
                date: Date.now()
              };
              purchasesController = new _Purchases2.default();
              _context6.next = 10;
              return purchasesController.create(purchase);

            case 10:
              _ref7 = _context6.sent;
              savedPurchase = _ref7.purchase;
              sale = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                payment_method: 'money',
                value: 300,
                products: [{
                  qty: 100,
                  product: ox._id
                }]
              };
              saleController = new _Sales2.default();
              _context6.next = 16;
              return saleController.create(sale);

            case 16:
              _ref8 = _context6.sent;
              savedSale = _ref8.sale;
              stockController = new _Stock2.default();
              _context6.next = 21;
              return stockController.getAll();

            case 21:
              stockEntries = _context6.sent;
              _context6.next = 24;
              return fetch(PRODUCTS_URL).then(function (res) {
                return res.json();
              });

            case 24:
              answer = _context6.sent;


              expect(answer.code).toEqual(200);
              expect(answer.body.length).toEqual(1);
              expect(answer.body[0].name).toEqual(ox.name);

              expect(answer.body[0].quantity).toEqual(900);
              expect(answer.body[0].price_per_unit).toEqual(0.1);
              expect(answer.body[0].avgPriceFiveLast).toEqual(0.1);

              expect(answer.body[0].stock[0].qty).toEqual(purchase.products[0].qty);
              expect(answer.body[0].stock[0].price_per_unit).toEqual(purchase.products[0].total_price / purchase.products[0].qty);

              expectedSourceOrDestinationOfPurchase = {
                seller: purchase.seller,
                purchase_id: savedPurchase.id
              };


              expect(answer.body[0].stock[0].sourceOrDestination).toEqual(expectedSourceOrDestinationOfPurchase);

              expect(answer.body[0].stock[1].qty).toEqual(sale.products[0].qty);
              expect(answer.body[0].stock[1].price_per_unit).toEqual(0.1);
              expect(answer.body[0].stock[1].sourceOrDestination).toEqual({
                name: sale.name + ' (' + client1.name + ')',
                sale_id: savedSale.id
              });

            case 38:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });

  describe('POST Route', function () {
    it('Can post a product', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var beforeList, productExample, res, afterList;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _Products2.default.find(function (err, products) {
                return products;
              });

            case 2:
              beforeList = _context7.sent;

              expect(beforeList.length).toBe(0);

              productExample = {
                name: 'OX',
                measure_unit: 'unit'
              };
              _context7.next = 7;
              return fetch(PRODUCTS_URL, {
                method: 'POST',
                body: JSON.stringify(productExample)
              }).then(function (res) {
                return res.json();
              });

            case 7:
              res = _context7.sent;
              _context7.next = 10;
              return _Products2.default.find(function (err, products) {
                return products;
              });

            case 10:
              afterList = _context7.sent;

              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(productExample.name);

              expect(res.code).toEqual(200);
              expect(res.body.name).toEqual(productExample.name);

            case 15:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined);
    })));

    it('Can\'t post a product with the same name of a previous product', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var beforeList, productExample, res1, res2, afterList;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              _context8.next = 2;
              return _Products2.default.find(function (err, products) {
                return products;
              });

            case 2:
              beforeList = _context8.sent;

              expect(beforeList.length).toBe(0);

              productExample = {
                name: 'OX',
                measure_unit: 'unit'
              };
              _context8.next = 7;
              return fetch(PRODUCTS_URL, {
                method: 'POST',
                body: JSON.stringify(productExample)
              }).then(function (res) {
                return res.json();
              });

            case 7:
              res1 = _context8.sent;
              _context8.next = 10;
              return fetch(PRODUCTS_URL, {
                method: 'POST',
                body: JSON.stringify(productExample)
              }).then(function (res) {
                return res.json();
              });

            case 10:
              res2 = _context8.sent;
              _context8.next = 13;
              return _Products2.default.find(function (err, products) {
                return products;
              });

            case 13:
              afterList = _context8.sent;


              expect(afterList.length).toBe(1);
              expect(afterList[0].name).toEqual(productExample.name);

              // Standard response
              // {
              //  code,
              //  body,
              // }
              expect(res2).toEqual({
                code: 422,
                errors: {
                  name: _errors.NOT_UNIQUE
                }
              });

            case 17:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, undefined);
    })));
  });
});