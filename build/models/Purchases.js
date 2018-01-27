'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongoTenant = require('mongo-tenant');

var _mongoTenant2 = _interopRequireDefault(_mongoTenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var purchasesSchema = (0, _mongoose.Schema)({
  seller: { type: String, required: true },
  date: { type: Date, required: true }
});

purchasesSchema.virtual('stockEntries', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'purchase'
});

purchasesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

purchasesSchema.set('toObject', { getters: true, virtuals: true });
purchasesSchema.set('toJSON', { getters: true, virtuals: true });
purchasesSchema.plugin(_mongoTenant2.default);

exports.default = _mongoose2.default.model('Purchases', purchasesSchema);