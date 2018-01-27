'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _Sales = require('../models/Sales');

var _Sales2 = _interopRequireDefault(_Sales);

var _Stock = require('../models/Stock');

var _Stock2 = _interopRequireDefault(_Stock);

var _Stock3 = require('./Stock');

var _Stock4 = _interopRequireDefault(_Stock3);

var _errors = require('../errors');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pad2 = function pad2(x) {
  return x > 9 ? x.toString() : '0' + x;
};

function calcProfit(sale) {
  var costOfProducts = sale.stockEntries.reduce(function (prevVal, entry) {
    return prevVal + entry.price_per_unit * entry.qty;
  }, 0);

  return _extends({}, sale, {
    profit: sale.payment.value_liquid - costOfProducts
  });
}

function calcSpentTime(sale) {
  var TimeSpent = new Date(sale.end_time - sale.start_time);

  return _extends({}, sale, {
    time_spent: TimeSpent.getHours() + ':' + pad2(TimeSpent.getMinutes())
  });
}

function calcProfitPerHour(sale) {
  var TimeSpent = new Date(sale.end_time - sale.start_time);
  var hours = TimeSpent.getHours() + TimeSpent.getMinutes() / 60;
  var profit_per_hour = (sale.profit / hours).toFixed(2);

  return _extends({}, sale, {
    profit_per_hour: profit_per_hour
  });
}

function hasProductEntriesErrors(products) {
  var errorCount = 0;

  var array = products.map(function (_ref) {
    var product = _ref.product,
        qty = _ref.qty;

    var errors = {};
    if (!product) {
      errors.product = _errors.BLANK;
      errorCount += 1;
    }
    if (!(qty > 0)) {
      errors.qty = _errors.NOT_POSITIVE;
      errorCount += 1;
    }
    return errors;
  });
  return errorCount ? array : null;
}

function hasErrors(_ref2) {
  var name = _ref2.name,
      client = _ref2.client,
      professional = _ref2.professional,
      start_time = _ref2.start_time,
      end_time = _ref2.end_time,
      payment_method = _ref2.payment_method,
      value = _ref2.value,
      _ref2$products = _ref2.products,
      products = _ref2$products === undefined ? [] : _ref2$products;

  var errors = {};

  if (!name) {
    errors.name = _errors.BLANK;
  }
  if (!client) {
    errors.client = _errors.BLANK;
  }
  if (!professional) {
    errors.professional = _errors.BLANK;
  }
  if (!start_time) {
    errors.start_time = _errors.BLANK;
  }
  if (!end_time) {
    errors.end_time = _errors.BLANK;
  }
  if (!payment_method) {
    errors.payment_method = _errors.BLANK;
  }
  if (!(value > 0)) {
    errors.value = _errors.NOT_POSITIVE;
  }

  var productErrors = hasProductEntriesErrors(products);
  if (productErrors) {
    errors.products = productErrors;
  }

  return Object.keys(errors).length || errors.products ? errors : null;
}

var Sales = function () {
  function Sales(tenantId) {
    _classCallCheck(this, Sales);

    this.Model = _Sales2.default.byTenant(tenantId);
    this.StockModel = _Stock2.default.byTenant(tenantId);
    this.Stock = new _Stock4.default(tenantId);
  }

  _createClass(Sales, [{
    key: 'getAll',
    value: function getAll() {
      return this.Model.find({}).sort({ start_time: 'descending' }).populate({
        path: 'stockEntries',
        populate: {
          path: 'product'
        }
      }).populate('client').populate('professional').then(function (sales) {
        return sales.map(function (sale) {
          return sale.toObject();
        });
      }).then(function (sales) {
        return sales.map(function (sale) {
          return calcProfit(sale);
        });
      }).then(function (sales) {
        return sales.map(function (sale) {
          return calcSpentTime(sale);
        });
      }).then(function (sales) {
        return sales.map(function (sale) {
          return calcProfitPerHour(sale);
        });
      });
    }
  }, {
    key: 'getOne',
    value: function getOne(id) {
      return this.Model.findById(id).populate({
        path: 'stockEntries',
        populate: {
          path: 'product'
        }
      }).populate('client').populate('professional').then(function (sale) {
        return sale ? sale.toObject() : null;
      }).then(function (sale) {
        return sale ? calcProfit(sale) : null;
      }).then(function (sale) {
        return sale ? calcSpentTime(sale) : null;
      }).then(function (sale) {
        return sale ? calcProfitPerHour(sale) : null;
      });
    }
  }, {
    key: 'update',
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(postBody) {
        var _this = this;

        var id, name, client, professional, start_time, end_time, payment_method, value, _postBody$products, products, errors, paymentFullInfo, saleFields, promises;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                id = postBody.id, name = postBody.name, client = postBody.client, professional = postBody.professional, start_time = postBody.start_time, end_time = postBody.end_time, payment_method = postBody.payment_method, value = postBody.value, _postBody$products = postBody.products, products = _postBody$products === undefined ? [] : _postBody$products;
                errors = hasErrors(postBody);

                if (!errors) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt('return', { errors: errors });

              case 4:
                paymentFullInfo = {
                  value_liquid: value,
                  value_total: value,
                  method: payment_method,
                  avaiable_at: start_time,
                  discount: 'none'
                };
                saleFields = {
                  name: name,
                  client: client,
                  professional: professional,
                  start_time: start_time,
                  end_time: end_time,
                  payment: paymentFullInfo
                };
                _context.next = 8;
                return this.Model.findByIdAndUpdate(id, { $set: saleFields }, { new: true });

              case 8:
                _context.next = 10;
                return this.StockModel.deleteMany({ sale: id.toString() });

              case 10:
                if (!(products.length > 0)) {
                  _context.next = 14;
                  break;
                }

                promises = products.map(function (item) {
                  return Promise.resolve(_this.Stock.create({
                    qty: item.qty,
                    product: item.product,
                    sale: id.toString(),
                    date: start_time
                  }));
                });
                _context.next = 14;
                return Promise.all(promises);

              case 14:
                _context.next = 16;
                return this.getOne(id);

              case 16:
                _context.t0 = _context.sent;
                return _context.abrupt('return', {
                  sale: _context.t0
                });

              case 18:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function update(_x) {
        return _ref3.apply(this, arguments);
      }

      return update;
    }()
  }, {
    key: 'create',
    value: function () {
      var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(postBody) {
        var _this2 = this;

        var name, client, professional, start_time, end_time, payment_method, value, _postBody$products2, products, errors, paymentFullInfo, sale, _ref5, sale_id, promises;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                name = postBody.name, client = postBody.client, professional = postBody.professional, start_time = postBody.start_time, end_time = postBody.end_time, payment_method = postBody.payment_method, value = postBody.value, _postBody$products2 = postBody.products, products = _postBody$products2 === undefined ? [] : _postBody$products2;
                errors = hasErrors(postBody);

                if (!errors) {
                  _context2.next = 4;
                  break;
                }

                return _context2.abrupt('return', { errors: errors });

              case 4:
                paymentFullInfo = {
                  value_liquid: value,
                  value_total: value,
                  method: payment_method,
                  avaiable_at: start_time,
                  discount: 'none'
                };
                sale = new this.Model({
                  name: name,
                  client: client,
                  professional: professional,
                  start_time: start_time,
                  end_time: end_time,
                  payment: paymentFullInfo
                });
                _context2.next = 8;
                return sale.save();

              case 8:
                _ref5 = _context2.sent;
                sale_id = _ref5.id;

                if (!(products.length > 0)) {
                  _context2.next = 14;
                  break;
                }

                promises = products.map(function (item) {
                  return Promise.resolve(_this2.Stock.create({
                    qty: item.qty,
                    product: item.product,
                    sale: sale_id,
                    date: start_time
                  }));
                });
                _context2.next = 14;
                return Promise.all(promises);

              case 14:
                _context2.next = 16;
                return this.getOne(sale_id);

              case 16:
                _context2.t0 = _context2.sent;
                return _context2.abrupt('return', {
                  sale: _context2.t0
                });

              case 18:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function create(_x2) {
        return _ref4.apply(this, arguments);
      }

      return create;
    }()
  }, {
    key: 'delete',
    value: function () {
      var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(id) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.Model.findByIdAndRemove(id);

              case 2:
                _context3.next = 4;
                return this.StockModel.deleteMany({ sale: id });

              case 4:
                return _context3.abrupt('return', true);

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _delete(_x3) {
        return _ref6.apply(this, arguments);
      }

      return _delete;
    }()
  }]);

  return Sales;
}();

exports.default = Sales;