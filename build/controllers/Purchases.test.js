'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Purchases = require('./Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Products = require('../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _Stock = require('../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Products3 = require('./Products');

var _Products4 = _interopRequireDefault(_Products3);

var _Purchases3 = require('../models/Purchases');

var _Purchases4 = _interopRequireDefault(_Purchases3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var productsController = new _Products4.default();
var sut = new _Purchases2.default();

var errLogger = function errLogger(err) {
  if (err) {
    // eslint-disable-next-line
    console.error(err);
  }
};

var cleanUpDB = function cleanUpDB() {
  return _Products2.default.deleteMany({}, errLogger).then(function () {
    return _Stock2.default.deleteMany({}, errLogger);
  }).then(function () {
    return _Purchases4.default.deleteMany({});
  }, errLogger);
};

describe('Purchases Controller', function () {
  beforeEach(function (done) {
    _mongoose2.default.Promise = global.Promise;
    _mongoose2.default.connect('mongodb://localhost/fv', { useMongoClient: true }).then(function () {
      return cleanUpDB();
    }).then(function () {
      return done();
    });
  });

  describe('With no entries yet', function () {
    var ox = void 0;
    var shampoo = void 0;
    beforeEach(function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(done) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return productsController.create({ name: 'ox', measure_unit: 'ml' }).then(function (_ref2) {
                  var product = _ref2.product;
                  return product;
                });

              case 2:
                ox = _context.sent;
                _context.next = 5;
                return productsController.create({ name: 'shampoo', measure_unit: 'ml' }).then(function (_ref3) {
                  var product = _ref3.product;
                  return product;
                });

              case 5:
                shampoo = _context.sent;


                done();

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, undefined);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());

    it('correctly posts a new purchase', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var postBody, purchases;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Prepare
              postBody = {
                products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: ox._id, qty: 1000, total_price: 40 }],
                seller: 'Company one',
                date: Date.now()
              };

              // Act

              _context2.next = 3;
              return sut.create(postBody);

            case 3:
              _context2.next = 5;
              return _Purchases4.default.find({}).populate('stockEntries');

            case 5:
              purchases = _context2.sent;


              expect(purchases[0].stockEntries.length).toBe(2);
              expect(purchases[0].seller).toEqual('Company one');
              expect(purchases[0].stockEntries[0].qty).toEqual(500);

            case 9:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('returns all purchases correctly with products and their name populated', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var postBody, purchases;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              // Prepare
              postBody = {
                products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: shampoo._id, qty: 1000, total_price: 40 }],
                seller: 'Company one',
                date: Date.now()
              };
              _context3.next = 3;
              return sut.create(postBody);

            case 3:
              _context3.next = 5;
              return sut.getAll();

            case 5:
              purchases = _context3.sent;


              // Assert
              expect(purchases[0].stockEntries[0].product.name).toEqual(ox.name);

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('With a default entry', function () {
    var ox = void 0;
    var shampoo = void 0;
    var cape = void 0;
    var purchaseExample = void 0;
    beforeEach(function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(done) {
        var postBody;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return productsController.create({ name: 'ox', measure_unit: 'ml' }).then(function (_ref7) {
                  var product = _ref7.product;
                  return product;
                });

              case 2:
                ox = _context4.sent;
                _context4.next = 5;
                return productsController.create({ name: 'shampoo', measure_unit: 'ml' }).then(function (_ref8) {
                  var product = _ref8.product;
                  return product;
                });

              case 5:
                shampoo = _context4.sent;
                _context4.next = 8;
                return productsController.create({ name: 'cape', measure_unit: 'unit' }).then(function (_ref9) {
                  var product = _ref9.product;
                  return product;
                });

              case 8:
                cape = _context4.sent;


                // create a purchase example
                postBody = {
                  products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: shampoo._id, qty: 1000, total_price: 40 }],
                  seller: 'Company one',
                  date: new Date()
                };
                _context4.next = 12;
                return sut.create(postBody).then(function (_ref10) {
                  var purchase = _ref10.purchase;
                  return purchase;
                });

              case 12:
                purchaseExample = _context4.sent;

                done();

              case 14:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, undefined);
      }));

      return function (_x2) {
        return _ref6.apply(this, arguments);
      };
    }());

    it('correctly update a sale', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var putBody, _ref12, updatedPurchase, seller, products, date;

      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              // Prepare
              putBody = {
                _id: purchaseExample._id,
                seller: 'Company two',
                date: new Date(),
                products: [{ id: shampoo._id, qty: 1000, total_price: 40 }, { id: cape._id, qty: 1, total_price: 1 }]
              };
              // Act

              _context5.next = 3;
              return sut.update(putBody);

            case 3:
              _ref12 = _context5.sent;
              updatedPurchase = _ref12.purchase;


              // Assert
              seller = putBody.seller, products = putBody.products, date = putBody.date;

              expect(updatedPurchase.seller).toEqual(seller);
              expect(updatedPurchase.date).toEqual(date);
              expect(updatedPurchase.stockEntries.length).toBe(2);

              expect(updatedPurchase.stockEntries[0]).toMatchObject({
                product: { name: shampoo.name },
                qty: products[0].qty,
                price_per_unit: products[0].total_price / products[0].qty
              });

              expect(updatedPurchase.stockEntries[1]).toMatchObject({
                product: { name: cape.name },
                qty: products[1].qty,
                price_per_unit: products[1].total_price / products[1].qty
              });

            case 11:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));

    it('removes a purchase when requested', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var exampleId, stockEntries;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              exampleId = purchaseExample._id.toString();
              // Act

              _context6.next = 3;
              return sut.delete(purchaseExample._id);

            case 3:
              _context6.t0 = expect;
              _context6.next = 6;
              return sut.getOne(exampleId);

            case 6:
              _context6.t1 = _context6.sent;
              (0, _context6.t0)(_context6.t1).toBe(null);
              _context6.next = 10;
              return _Stock2.default.find({ purchase: purchaseExample._id });

            case 10:
              stockEntries = _context6.sent;

              expect(stockEntries).toEqual([]);

            case 12:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));
  });
});