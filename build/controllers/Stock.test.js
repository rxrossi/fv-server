'use strict';

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _Sales = require('../controllers/Sales');

var _Sales2 = _interopRequireDefault(_Sales);

var _Stock = require('./Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Purchases = require('../controllers/Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Products = require('../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _Stock3 = require('../models/Stock');

var _Stock4 = _interopRequireDefault(_Stock3);

var _Clients = require('../models/Clients');

var _Clients2 = _interopRequireDefault(_Clients);

var _Professionals = require('../models/Professionals');

var _Professionals2 = _interopRequireDefault(_Professionals);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var errHandler = function errHandler(cb) {
  return function (err) {
    if (err) {
      console.error('an error', err);
    }
    cb();
  };
};

describe('StockController', function () {
  var sut = void 0;

  beforeEach(function (done) {
    _mongoose2.default.Promise = global.Promise;
    _mongoose2.default.connect('mongodb://localhost/fv', { useMongoClient: true }).then(function () {
      return done();
    });
  });

  // Delete all Professionals
  beforeEach(function (done) {
    return _Professionals2.default.deleteMany({}, errHandler(done));
  });
  afterEach(function (done) {
    return _Professionals2.default.deleteMany({}, errHandler(done));
  });

  // Delete all Clients
  beforeEach(function (done) {
    return _Clients2.default.deleteMany({}, errHandler(done));
  });
  afterEach(function (done) {
    return _Clients2.default.deleteMany({}, errHandler(done));
  });

  // Delete all products
  beforeEach(function (done) {
    return _Products2.default.deleteMany({}, errHandler(done));
  });
  afterEach(function (done) {
    return _Products2.default.deleteMany({}, errHandler(done));
  });

  // Delete all stock
  beforeEach(function (done) {
    return _Stock4.default.deleteMany({}, errHandler(done));
  });
  afterEach(function (done) {
    return _Stock4.default.deleteMany({}, errHandler(done));
  });

  describe('With entries', function () {
    var ox = void 0;
    beforeEach(function (done) {
      ox = new _Products2.default({ name: 'OX', measure_unit: 'ml' });

      ox.save(function (err, product) {
        if (err) {
          console.error(err);
        }

        var entryOne = new _Stock4.default({
          product: product._id,
          date: '10 27 2017',
          qty: 1,
          price_per_unit: 10
        });

        entryOne.save(function (errEntry) {
          if (errEntry) {
            console.error('entry', err);
          }
          done();
        });
      });
    });

    it('return a stock entry', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var answer;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Prepare
              sut = new _Stock2.default();

              // Act
              _context.next = 3;
              return sut.getAll();

            case 3:
              answer = _context.sent;


              // Assert
              expect(answer[0].qty).toBe(1);
              expect(answer[0].price_per_unit).toBe(10);
              expect(answer[0].product.name).toBe(ox.name);
              expect(answer[0].product.measure_unit).toBe(ox.measure_unit);

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, undefined);
    })));
  });

  describe('Without entries, adding a new one', function () {
    var ox = void 0;
    beforeEach(function (done) {
      ox = new _Products2.default({ name: 'OX', measure_unit: 'ml' });

      ox.save(function (err) {
        return errHandler(done)(err);
      });
    });

    it('adds a stock entry', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var _ref3, productId, postBody, stock;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _Products2.default.findOne({ name: ox.name });

            case 2:
              _ref3 = _context2.sent;
              productId = _ref3.id;
              postBody = {
                product: productId,
                qty: 4,
                total_price: 12,
                date: '10 10 2017'
              };


              sut = new _Stock2.default();

              _context2.next = 8;
              return sut.create(postBody);

            case 8:
              _context2.next = 10;
              return sut.getAll();

            case 10:
              stock = _context2.sent;


              // Assert
              expect(stock[0].product.name).toEqual(ox.name);
              expect(stock[0].price).toEqual(postBody.price);
              expect(stock[0].qty).toEqual(postBody.qty);

            case 14:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, undefined);
    })));
  });

  describe('Integration with Products and Sales Controller', function () {
    var client1 = void 0;
    var ox = void 0;
    var professional1 = void 0;
    var purchase = void 0;
    var sale = void 0;
    var saleResponseFromController = void 0;
    var purchaseResponseFromController = void 0;
    var sut = new _Stock2.default();

    beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
      var purchasesController, salesController;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
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
              _context3.next = 10;
              return purchasesController.create(purchase);

            case 10:
              purchaseResponseFromController = _context3.sent;


              sale = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2018, 1, 1, 10, 0),
                end_time: new Date(2018, 1, 1, 14, 0),
                payment_method: 'money',
                value: 300,
                products: [{
                  qty: 100,
                  product: ox._id
                }]
              };
              salesController = new _Sales2.default();
              _context3.next = 15;
              return salesController.create(sale);

            case 15:
              saleResponseFromController = _context3.sent;

            case 16:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, undefined);
    })));

    it('returns apropriated sourceOrDestination for a purchase', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var stock;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return sut.getAll();

            case 2:
              stock = _context4.sent;

              // console.log(stock[0]);
              expect(stock[0].sourceOrDestination).toEqual({
                seller: purchaseResponseFromController.purchase.seller,
                purchase_id: purchaseResponseFromController.purchase._id
              });

            case 4:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, undefined);
    })));

    it('returns apropriated sourceOrDestination for a sale', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var stock;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return sut.getAll();

            case 2:
              stock = _context5.sent;

              expect(stock[1].sourceOrDestination).toEqual({
                name: saleResponseFromController.sale.name + ' (' + client1.name + ')',
                sale_id: saleResponseFromController.sale._id
              });

            case 4:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));
  });
});