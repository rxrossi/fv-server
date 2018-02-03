import mongoose, { Schema } from 'mongoose';
import mongoTenant from 'mongo-tenant';

const stockSchema = Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  sale: { type: Schema.Types.ObjectId, ref: 'Sales' },
  purchase: { type: Schema.Types.ObjectId, ref: 'Purchases' },
  qty: { type: Number, required: true },
  price_per_unit: { type: Number, required: true },
  date: { type: Date, required: true },
});

stockSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

stockSchema.set('toJSON', {
  virtuals: true,
});

stockSchema.set('toObject', {
  virtuals: true,
});

stockSchema.plugin(mongoTenant);

export default mongoose.model('Stock', stockSchema);
