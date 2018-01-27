'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongoTenant = require('mongo-tenant');

var _mongoTenant2 = _interopRequireDefault(_mongoTenant);

require('../models/Purchases');

require('../models/Sales');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var stockSchema = (0, _mongoose.Schema)({
  product: { type: _mongoose.Schema.Types.ObjectId, ref: 'Product' },
  sale: { type: _mongoose.Schema.Types.ObjectId, ref: 'Sales' },
  purchase: { type: _mongoose.Schema.Types.ObjectId, ref: 'Purchases' },
  qty: { type: Number, required: true },
  price_per_unit: { type: Number, required: true },
  date: { type: Date, required: true }
});

stockSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

stockSchema.set('toJSON', {
  virtuals: true
});

stockSchema.set('toObject', {
  virtuals: true
});

stockSchema.plugin(_mongoTenant2.default);

exports.default = _mongoose2.default.model('Stock', stockSchema);