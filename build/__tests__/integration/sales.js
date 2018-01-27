'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

require('isomorphic-fetch');

var _joi = require('joi');

var _joi2 = _interopRequireDefault(_joi);

var _Purchases = require('../../models/Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Sales = require('../../models/Sales');

var _Sales2 = _interopRequireDefault(_Sales);

var _Stock = require('../../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Products = require('../../models/Products');

var _Products2 = _interopRequireDefault(_Products);

var _Purchases3 = require('../../controllers/Purchases');

var _Purchases4 = _interopRequireDefault(_Purchases3);

var _Sales3 = require('../../controllers/Sales');

var _Sales4 = _interopRequireDefault(_Sales3);

var _Clients = require('../../models/Clients');

var _Clients2 = _interopRequireDefault(_Clients);

var _Professionals = require('../../models/Professionals');

var _Professionals2 = _interopRequireDefault(_Professionals);

var _configureServer = require('../../configureServer');

var _configureServer2 = _interopRequireDefault(_configureServer);

var _errors = require('../../errors');

var _joiAssertRequirePresence = require('../../joiAssertRequirePresence');

var _joiAssertRequirePresence2 = _interopRequireDefault(_joiAssertRequirePresence);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /* global fetch */


var SALES_URL = 'http://localhost:5001/sales';

var genericErrorHandler = function genericErrorHandler(err) {
  if (err) {
    throw new Error(err);
  }
};

var cleanUpDB = function cleanUpDB() {
  return _Purchases2.default.deleteMany({}, genericErrorHandler).then(function () {
    return _Products2.default.deleteMany({}, genericErrorHandler);
  }).then(function () {
    return _Clients2.default.deleteMany({}, genericErrorHandler);
  }).then(function () {
    return _Professionals2.default.deleteMany({}, genericErrorHandler);
  }).then(function () {
    return _Stock2.default.deleteMany({}, genericErrorHandler);
  }).then(function () {
    return _Sales2.default.deleteMany({}, genericErrorHandler);
  });
};

describe('Sales routes', function () {
  var server = void 0;
  var ox = void 0;
  var shampoo = void 0;
  var cape = void 0;
  var client1 = void 0;
  var professional1 = void 0;

  beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var purchaseBody, purchaseController;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return (0, _configureServer2.default)().then(function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(sv) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return sv.start();

                      case 2:
                        return _context.abrupt('return', sv);

                      case 3:
                      case 'end':
                        return _context.stop();
                    }
                  }
                }, _callee, undefined);
              }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());

          case 2:
            server = _context2.sent;
            _context2.next = 5;
            return cleanUpDB();

          case 5:
            _context2.next = 7;
            return new _Clients2.default({ name: 'Mary', phone: '999' }).save();

          case 7:
            client1 = _context2.sent;
            _context2.next = 10;
            return new _Professionals2.default({ name: 'Carl' }).save();

          case 10:
            professional1 = _context2.sent;
            _context2.next = 13;
            return new _Products2.default({ name: 'OX', measure_unit: 'ml' }).save();

          case 13:
            ox = _context2.sent;
            _context2.next = 16;
            return new _Products2.default({ name: 'shampoo', measure_unit: 'ml' }).save();

          case 16:
            shampoo = _context2.sent;
            _context2.next = 19;
            return new _Products2.default({ name: 'cape', measure_unit: 'unit' }).save();

          case 19:
            cape = _context2.sent;
            purchaseBody = {
              products: [{ id: ox._id, qty: 500, total_price: 90 }, { id: shampoo._id, qty: 1000, total_price: 40 }, { id: cape._id, qty: 1000, total_price: 10 }],
              seller: 'Company one',
              date: Date.now()
            };
            purchaseController = new _Purchases4.default();
            _context2.next = 24;
            return purchaseController.create(purchaseBody);

          case 24:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  })));

  afterEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return cleanUpDB();

          case 2:
            _context3.next = 4;
            return server.stop();

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, undefined);
  })));

  describe('GET route', function () {
    it('returns an empty list when there are no records', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
      var answer;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return fetch(SALES_URL).then(function (res) {
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

    it('return a list of sales when there are', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
      var postBody, salesController, getBody, firstSale, joiGetBody, stockEntryOneSchema;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              // Writting on db
              postBody = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                payment_method: 'money',
                value: 300,
                products: [{
                  qty: 250,
                  product: ox._id
                }, {
                  qty: 500,
                  product: shampoo._id
                }]
              };
              salesController = new _Sales4.default();
              _context5.next = 4;
              return salesController.create(postBody);

            case 4:
              _context5.next = 6;
              return fetch(SALES_URL).then(function (res) {
                return res.json();
              });

            case 6:
              getBody = _context5.sent;


              expect(getBody.body.length).toBe(1);

              firstSale = getBody.body[0];
              joiGetBody = _joi2.default.object().keys({
                _id: _joi2.default.string(),
                id: _joi2.default.string(),
                name: 'service one',
                client: _extends({}, client1.toObject(), {
                  _id: _joi2.default.string()
                }),
                professional: _extends({}, professional1.toObject(), {
                  _id: _joi2.default.string()
                }),
                start_time: _joi2.default.date(),
                end_time: _joi2.default.date(),
                time_spent: _joi2.default.string(),
                profit_per_hour: _joi2.default.number(),
                payment: {
                  value_total: 300,
                  value_liquid: 300,
                  discount: 'none',
                  method: 'money',
                  avaiable_at: _joi2.default.date()
                },
                stockEntries: _joi2.default.array().length(2),
                profit: 300 - 45 - 20, // value_liquid - products
                __v: _joi2.default.number()
              });


              _joi2.default.assert(firstSale, joiGetBody);

              stockEntryOneSchema = _joi2.default.object().keys({
                _id: _joi2.default.string(),
                id: _joi2.default.string(),
                __v: _joi2.default.number(),
                date: _joi2.default.string(),
                sale: _joi2.default.string(),
                qty: _joi2.default.number(),
                price_per_unit: _joi2.default.number(),
                product: _joi2.default.object()
              });

              _joi2.default.assert(firstSale.stockEntries[0], stockEntryOneSchema);

            case 13:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, undefined);
    })));
  });

  describe('POST route', function () {
    it('records a POST request on database', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
      var postBody, response, joiGetBody, stockEntryOneSchema;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              postBody = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                payment_method: 'money',
                value: 300,
                products: [{
                  qty: 250,
                  product: ox._id
                }, {
                  qty: 500,
                  product: shampoo._id
                }]
              };
              _context6.next = 3;
              return fetch(SALES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (res) {
                return res.json();
              });

            case 3:
              response = _context6.sent;


              expect(response.code).toBe(200);

              joiGetBody = _joi2.default.object().keys({
                _id: _joi2.default.string(),
                id: _joi2.default.string(),
                name: 'service one',
                client: _extends({}, client1.toObject(), {
                  _id: _joi2.default.string()
                }),
                professional: _extends({}, professional1.toObject(), {
                  _id: _joi2.default.string()
                }),
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                time_spent: '6:00',
                profit_per_hour: 39.17,
                payment: {
                  value_total: 300,
                  value_liquid: 300,
                  discount: 'none',
                  method: 'money',
                  avaiable_at: _joi2.default.any()
                },
                stockEntries: _joi2.default.array().length(2),
                profit: 300 - 45 - 20, // value_liquid - products
                __v: _joi2.default.number()
              });


              expect((0, _joiAssertRequirePresence2.default)(joiGetBody, response.body)).toBe(null);

              stockEntryOneSchema = _joi2.default.object().keys({
                _id: _joi2.default.string(),
                id: _joi2.default.string(),
                __v: _joi2.default.number(),
                date: _joi2.default.string(),
                sale: _joi2.default.string(),
                qty: _joi2.default.number(),
                price_per_unit: _joi2.default.number(),
                product: _joi2.default.object()
              });

              _joi2.default.assert(response.body.stockEntries[0], stockEntryOneSchema);

            case 9:
            case 'end':
              return _context6.stop();
          }
        }
      }, _callee6, undefined);
    })));

    it('records a sale without products', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
      var postBody, response, joiGetBody;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              postBody = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                payment_method: 'money',
                value: 300
              };
              _context7.next = 3;
              return fetch(SALES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (res) {
                return res.json();
              });

            case 3:
              response = _context7.sent;


              expect(response.code).toBe(200);

              joiGetBody = _joi2.default.object().keys({
                _id: _joi2.default.string(),
                id: _joi2.default.string(),
                name: 'service one',
                client: _extends({}, client1.toObject(), {
                  _id: _joi2.default.string()
                }),
                professional: _extends({}, professional1.toObject(), {
                  _id: _joi2.default.string()
                }),
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                time_spent: '6:00',
                profit_per_hour: 50,
                payment: {
                  value_total: 300,
                  value_liquid: 300,
                  discount: 'none',
                  method: 'money',
                  avaiable_at: _joi2.default.any()
                },
                stockEntries: _joi2.default.array().length(0),
                profit: 300, // value_liquid - products
                __v: _joi2.default.number()
              });

              expect((0, _joiAssertRequirePresence2.default)(joiGetBody, response.body)).toBe(null);

            case 7:
            case 'end':
              return _context7.stop();
          }
        }
      }, _callee7, undefined);
    })));

    it('returns an error case it is needed', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
      var postBody, expectedErrors, response;
      return regeneratorRuntime.wrap(function _callee8$(_context8) {
        while (1) {
          switch (_context8.prev = _context8.next) {
            case 0:
              postBody = {
                name: '',
                client: '',
                professional: '',
                start_time: '',
                end_time: '',
                payment_method: '',
                value: '',
                products: [{
                  qty: 250,
                  product: ''
                }, {
                  qty: undefined,
                  product: shampoo._id
                }]
              };
              expectedErrors = {
                name: _errors.BLANK,
                client: _errors.BLANK,
                professional: _errors.BLANK,
                start_time: _errors.BLANK,
                end_time: _errors.BLANK,
                payment_method: _errors.BLANK,
                value: _errors.NOT_POSITIVE,
                products: [{
                  product: _errors.BLANK
                }, {
                  qty: _errors.NOT_POSITIVE
                }]
              };
              _context8.next = 4;
              return fetch(SALES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (res) {
                return res.json();
              });

            case 4:
              response = _context8.sent;


              expect(response.errors).toEqual(expectedErrors);

              expect(response.code).toBe(422);

            case 7:
            case 'end':
              return _context8.stop();
          }
        }
      }, _callee8, undefined);
    })));
  });

  describe('PUT and DELETE routes', function () {
    var saleId = void 0;
    var postBody = void 0;

    beforeEach(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
      var response;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              postBody = {
                name: 'service one',
                client: client1._id,
                professional: professional1._id,
                start_time: new Date(2017, 11, 7, 10, 0),
                end_time: new Date(2017, 11, 7, 16, 0),
                payment_method: 'money',
                value: 300,
                products: [{
                  qty: 250,
                  product: ox._id
                }, {
                  qty: 500,
                  product: shampoo._id
                }]
              };
              _context9.next = 3;
              return fetch(SALES_URL, {
                method: 'POST',
                body: JSON.stringify(postBody)
              }).then(function (res) {
                return res.json();
              });

            case 3:
              response = _context9.sent;


              saleId = response.body.id;

            case 5:
            case 'end':
              return _context9.stop();
          }
        }
      }, _callee9, undefined);
    })));

    it('can update a sale', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
      var putBody, response;
      return regeneratorRuntime.wrap(function _callee10$(_context10) {
        while (1) {
          switch (_context10.prev = _context10.next) {
            case 0:
              // Prepare
              putBody = _extends({
                id: saleId
              }, postBody, {
                name: 'service two',
                products: [{ qty: 1, product: cape._id }]
              });

              // Act

              _context10.next = 3;
              return fetch(SALES_URL, {
                method: 'PUT',
                body: JSON.stringify(putBody)
              }).then(function (res) {
                return res.json();
              });

            case 3:
              response = _context10.sent;


              // Assert
              expect(response.body.stockEntries.length).toBe(1);
              expect(response.body.stockEntries[0].product.name).toBe(cape.name);
              expect(response.body.name).toEqual('service two');

            case 7:
            case 'end':
              return _context10.stop();
          }
        }
      }, _callee10, undefined);
    })));

    it('can delete a sale', _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11() {
      var response, salesController, sale;
      return regeneratorRuntime.wrap(function _callee11$(_context11) {
        while (1) {
          switch (_context11.prev = _context11.next) {
            case 0:
              _context11.next = 2;
              return fetch(SALES_URL, {
                method: 'DELETE',
                body: JSON.stringify(saleId)
              }).then(function (res) {
                return res.json();
              });

            case 2:
              response = _context11.sent;


              // Assert
              expect(response.code).toBe(204);

              salesController = new _Sales4.default();
              _context11.next = 7;
              return salesController.getOne(saleId);

            case 7:
              sale = _context11.sent;

              expect(sale).toEqual(null);

            case 9:
            case 'end':
              return _context11.stop();
          }
        }
      }, _callee11, undefined);
    })));
  });
});