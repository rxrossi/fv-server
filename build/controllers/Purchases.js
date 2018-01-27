'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Purchases = require('../models/Purchases');

var _Purchases2 = _interopRequireDefault(_Purchases);

var _Stock = require('./Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Stock3 = require('../models/Stock');

var _Stock4 = _interopRequireDefault(_Stock3);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function addTotalPrice(purchases) {
  return purchases.map(function (purchase) {
    return _extends({}, purchase, {
      price: purchase.stockEntries.reduce(function (prev, entry) {
        return prev + entry.price_per_unit * entry.qty;
      }, 0)
    });
  });
}

function hasProductEntriesErrors(products) {
  var errorCount = 0;

  var array = products.map(function (_ref) {
    var id = _ref.id,
        qty = _ref.qty,
        total_price = _ref.total_price;

    var errors = {};
    if (!id) {
      errors.id = _errors.BLANK;
      errorCount += 1;
    }
    if (!(qty > 0)) {
      errors.qty = _errors.NOT_POSITIVE;
      errorCount += 1;
    }
    if (!(total_price > 0)) {
      errors.total_price = _errors.NOT_POSITIVE;
      errorCount += 1;
    }
    return errors;
  });
  return errorCount ? array : null;
}

function hasErrors(_ref2) {
  var date = _ref2.date,
      seller = _ref2.seller,
      _ref2$products = _ref2.products,
      products = _ref2$products === undefined ? [] : _ref2$products;

  var errors = {};
  if (!seller) {
    errors.seller = _errors.BLANK;
  }
  if (!date) {
    errors.date = _errors.BLANK;
  }
  if (!products.length) {
    errors.emptyProducts = !products.length;
  }

  var productErrors = hasProductEntriesErrors(products);
  if (productErrors) {
    errors.products = productErrors;
  }

  return Object.keys(errors).length || errors.products ? errors : null;
}

var Purchases = function () {
  function Purchases(tenantId) {
    var Model = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Purchases2.default;

    _classCallCheck(this, Purchases);

    this.Model = Model.byTenant(tenantId);
    this.Stock = new _Stock2.default(tenantId);
    this.StockModel = _Stock4.default.byTenant(tenantId);
  }

  _createClass(Purchases, [{
    key: 'create',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(body) {
        var _this = this;

        var errors, purchase, _ref4, purchase_id;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                errors = hasErrors(body);

                if (!errors) {
                  _context2.next = 3;
                  break;
                }

                return _context2.abrupt('return', { errors: errors });

              case 3:
                purchase = new this.Model(body);
                _context2.next = 6;
                return purchase.save();

              case 6:
                _ref4 = _context2.sent;
                purchase_id = _ref4.id;


                body.products.map(function () {
                  var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(item) {
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return _this.Stock.create({
                              product: item.id,
                              purchase: purchase_id,
                              qty: item.qty,
                              total_price: item.total_price,
                              date: body.date
                            });

                          case 2:
                          case 'end':
                            return _context.stop();
                        }
                      }
                    }, _callee, _this);
                  }));

                  return function (_x3) {
                    return _ref5.apply(this, arguments);
                  };
                }());

                _context2.next = 11;
                return this.getOne(purchase_id);

              case 11:
                _context2.t0 = _context2.sent;
                return _context2.abrupt('return', {
                  purchase: _context2.t0
                });

              case 13:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function create(_x2) {
        return _ref3.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'update',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref7) {
        var _this2 = this;

        var _id = _ref7._id,
            seller = _ref7.seller,
            date = _ref7.date,
            products = _ref7.products;
        var errors;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                errors = hasErrors({
                  _id: _id, seller: seller, date: date, products: products
                });

                if (!errors) {
                  _context4.next = 3;
                  break;
                }

                return _context4.abrupt('return', {
                  errors: errors
                });

              case 3:
                _context4.next = 5;
                return this.Model.findByIdAndUpdate(_id, { $set: { seller: seller, date: date } }, { new: true });

              case 5:
                _context4.next = 7;
                return this.StockModel.deleteMany({ purchase: _id });

              case 7:
                // create new entries based on body.products
                products.map(function () {
                  var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(item) {
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            _context3.next = 2;
                            return _this2.Stock.create({
                              product: item.id,
                              purchase: _id,
                              qty: item.qty,
                              total_price: item.total_price,
                              date: date
                            });

                          case 2:
                          case 'end':
                            return _context3.stop();
                        }
                      }
                    }, _callee3, _this2);
                  }));

                  return function (_x5) {
                    return _ref8.apply(this, arguments);
                  };
                }());

                _context4.next = 10;
                return this.getOne(_id);

              case 10:
                _context4.t0 = _context4.sent;
                return _context4.abrupt('return', {
                  purchase: _context4.t0
                });

              case 12:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function update(_x4) {
        return _ref6.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'delete',
    value: function () {
      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(id) {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return this.StockModel.deleteMany({ purchase: id });

              case 2:
                _context5.next = 4;
                return this.Model.findByIdAndRemove(id);

              case 4:
                return _context5.abrupt('return', true);

              case 5:
              case 'end':
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _delete(_x6) {
        return _ref9.apply(this, arguments);
      }

      return _delete;
    }()
  }, {
    key: 'getOne',
    value: function () {
      var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(id) {
        var purchase;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return this.Model.findById(id);

              case 2:
                purchase = _context6.sent;

                if (purchase) {
                  _context6.next = 5;
                  break;
                }

                return _context6.abrupt('return', null);

              case 5:
                return _context6.abrupt('return', this.Model.findById(id).populate({
                  path: 'stockEntries',
                  populate: {
                    path: 'product',
                    select: 'name measure_unit'
                  }
                }).then(function (x) {
                  return x.toObject();
                }).then(function (x) {
                  return addTotalPrice([x])[0];
                }));

              case 6:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function getOne(_x7) {
        return _ref10.apply(this, arguments);
      }

      return getOne;
    }()
  }, {
    key: 'getAll',
    value: function getAll() {
      return this.Model.find({}).sort({ date: 'descending' }).populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit'
        }
      }).then(function (purchases) {
        return purchases.map(function (purchase) {
          return purchase.toObject();
        });
      }).then(function (purchases) {
        return addTotalPrice(purchases);
      });
    }
  }]);

  return Purchases;
}();

exports.default = Purchases;