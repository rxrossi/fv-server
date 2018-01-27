'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Products = require('./Products');

var _Products2 = _interopRequireDefault(_Products);

var _Products3 = require('../models/Products');

var _Products4 = _interopRequireDefault(_Products3);

var _Stock = require('../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var errLogger = function errLogger(err) {
  if (err) {
    console.error(err);
  }
};

describe('ProductsController', function () {
  var sut = void 0;
  beforeEach(function (done) {
    _mongoose2.default.Promise = global.Promise;
    _mongoose2.default.connect('mongodb://localhost/fv', { useMongoClient: true }).then(function () {
      return done();
    });
  });

  beforeEach(function (done) {
    _Products4.default.deleteMany({}, errLogger).then(function () {
      return _Stock2.default.deleteMany({}, errLogger);
    }).then(function () {
      return done();
    });
  });

  afterEach(function (done) {
    _Products4.default.deleteMany({}, errLogger).then(function () {
      return _Stock2.default.deleteMany({}, errLogger);
    }).then(function () {
      return done();
    });
  });

  describe('GET', function () {
    it('returns getAll when there are products', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var ox, products;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Prepare
              ox = new _Products4.default({ name: 'OX', measure_unit: 'ml' });
              _context.next = 3;
              return ox.save(function (err, product) {
                if (err) {
                  console.error(err);
                }
                var entryOne = new _Stock2.default({
                  product: product._id,
                  date: '10 27 2017',
                  qty: 1,
                  price_per_unit: 10
                });

                entryOne.save(function (error) {
                  if (error) {
                    console.error('entry', error);
                  }
                });
              });

            case 3:

              sut = new _Products2.default();

              // Act
              _context.next = 6;
              return sut.getAll();

            case 6:
              products = _context.sent;


              // Assert
              expect(products[0].price_per_unit).toBe(10);
              expect(products[0].quantity).toBe(1);
              expect(products[0].avgPriceFiveLast).toBe(10);

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));
  });

  describe('CREATE', function () {
    it('creates a product', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var ox, _ref3, product;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              ox = { name: 'OX', measure_unit: 'ml' };


              sut = new _Products2.default();

              _context2.next = 4;
              return sut.create(ox);

            case 4:
              _ref3 = _context2.sent;
              product = _ref3.product;


              expect(product.name).toEqual(ox.name);

            case 7:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));

    it('cannot create a product with duplicated name', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var ox, _ref5, errors;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              ox = { name: 'OX', measure_unit: 'ml' };


              sut = new _Products2.default();

              _context3.next = 4;
              return sut.create(ox);

            case 4:
              _context3.next = 6;
              return sut.create(ox);

            case 6:
              _ref5 = _context3.sent;
              errors = _ref5.errors;


              expect(errors.name).toEqual('NOT_UNIQUE');

            case 9:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));
  });

  describe('Update', function () {
    it('can update a product', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var ox, updatedOx, _ref7, product;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              // Prepare
              ox = new _Products4.default({ name: 'OX', measure_unit: 'ml' });
              _context4.next = 3;
              return ox.save(function (err, product) {
                if (err) {
                  console.error(err);
                }
                var entryOne = new _Stock2.default({
                  product: product._id,
                  date: '10 27 2017',
                  qty: 1,
                  price_per_unit: 10
                });

                entryOne.save(function (error) {
                  if (error) {
                    console.error('entry', error);
                  }
                });
              });

            case 3:
              updatedOx = {
                _id: ox._id,
                name: 'updatedOX',
                measure_unit: 'ml'
              };


              sut = new _Products2.default();

              // Act
              _context4.next = 7;
              return sut.update(updatedOx);

            case 7:
              _ref7 = _context4.sent;
              product = _ref7.product;


              // Assert
              expect(product.name).toEqual('updatedOX');

            case 10:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));
  });
  describe('DELETE', function () {
    it('marks a product as deleted', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var ox, productsAfterDelete;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              // Prepare
              ox = new _Products4.default({ name: 'OX', measure_unit: 'ml' });
              _context5.next = 3;
              return ox.save(function (err, product) {
                if (err) {
                  console.error(err);
                }
                var entryOne = new _Stock2.default({
                  product: product._id,
                  date: '10 27 2017',
                  qty: 1,
                  price_per_unit: 10
                });

                entryOne.save(function (error) {
                  if (error) {
                    console.error('entry', error);
                  }
                });
              });

            case 3:

              sut = new _Products2.default();

              // Act
              _context5.next = 6;
              return sut.delete(ox._id);

            case 6:
              _context5.next = 8;
              return sut.getAll();

            case 8:
              productsAfterDelete = _context5.sent;


              // Assert
              expect(productsAfterDelete).toEqual([]);

            case 10:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));
  });
});