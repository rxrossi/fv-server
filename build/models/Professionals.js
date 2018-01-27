'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _mongoTenant = require('mongo-tenant');

var _mongoTenant2 = _interopRequireDefault(_mongoTenant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var professionalsSchema = _mongoose2.default.Schema({
  name: { type: String, unique: true },
  phone: String
});

professionalsSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

professionalsSchema.set('toObject', { getters: true, virtuals: true });
professionalsSchema.set('toJSON', { getters: true, virtuals: true });
professionalsSchema.plugin(_mongoTenant2.default);

exports.default = _mongoose2.default.model('Professional', professionalsSchema);