'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongoTenant = require('mongo-tenant');

var _mongoTenant2 = _interopRequireDefault(_mongoTenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import Product from '../models/Products';
// import Stock from '../models/Stock';
// import Client from '../models/Clients';
// import Professional from '../models/Professionals';

var salesSchema = (0, _mongoose.Schema)({
  name: { type: String, required: true },
  client: { type: _mongoose.Schema.Types.ObjectId, ref: 'Client' },
  professional: { type: _mongoose.Schema.Types.ObjectId, ref: 'Professional' },
  start_time: { type: Date, required: true },
  end_time: { type: Date, required: true },
  payment: {
    value_total: { type: Number, required: true },
    value_liquid: { type: Number, required: true },
    method: { type: String, required: true },
    discount: { type: String, required: true }, // Ex.: value - 11%
    avaiable_at: { type: Date, required: true }
  }
});

salesSchema.virtual('stockEntries', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'sale'
});

salesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

salesSchema.set('toObject', { getters: true, virtuals: true });
salesSchema.set('toJSON', { getters: true, virtuals: true });
salesSchema.plugin(_mongoTenant2.default);

exports.default = _mongoose2.default.model('Sales', salesSchema);