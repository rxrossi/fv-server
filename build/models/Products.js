'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.addPrice = addPrice;
exports.addQuantity = addQuantity;
exports.addAvgPriceFiveLast = addAvgPriceFiveLast;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongooseDelete = require('mongoose-delete');

var _mongooseDelete2 = _interopRequireDefault(_mongooseDelete);

var _mongoTenant = require('mongo-tenant');

var _mongoTenant2 = _interopRequireDefault(_mongoTenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addPrice(product) {
  if (!product.stock.length) {
    return _extends({}, product, {
      price: ''
    });
  }
  return _extends({}, product, {
    price_per_unit: product.stock.find(function (entry) {
      return entry.qty > 0;
    }).price_per_unit
  });
}

function addQuantity(product) {
  return _extends({}, product, {
    quantity: product.stock.reduce(function (prev, _ref) {
      var qty = _ref.qty,
          sale = _ref.sale;

      var positiveOrNegativeQuantity = sale ? qty * -1 : qty;
      return positiveOrNegativeQuantity + prev;
    }, 0)
  });
}

function addAvgPriceFiveLast(product) {
  if (!product.stock.length) {
    return _extends({}, product, {
      avgPriceFiveLast: ''
    });
  }

  var fiveLastPurchases = product.stock.filter(function (_ref2) {
    var qty = _ref2.qty;
    return qty > 0;
  }).slice(0, 5);

  var countOfPrices = fiveLastPurchases.length;

  var avgPrice = fiveLastPurchases.reduce(function (prev, _ref3) {
    var price_per_unit = _ref3.price_per_unit;
    return prev + price_per_unit;
  }, 0) / countOfPrices;

  return _extends({}, product, {
    avgPriceFiveLast: avgPrice
  });
}

var productSchema = new _mongoose.Schema({
  name: String,
  measure_unit: String
});

productSchema.plugin(_mongooseDelete2.default);

productSchema.virtual('stock', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'product'
});

productSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

productSchema.set('toObject', { getters: true, virtuals: true });
productSchema.set('toJSON', { getters: true, virtuals: true });
productSchema.plugin(_mongoTenant2.default);

exports.default = _mongoose2.default.model('Product', productSchema);