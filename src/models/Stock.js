import mongoose, { Schema } from 'mongoose';
import Product from '../models/Products';
import Purchase from '../models/Purchases';

const stockSchema = Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },
  sale: { type: Schema.Types.ObjectId, ref: 'Sales' },
  purchase: { type: Schema.Types.ObjectId, ref: 'Purchase' },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
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

export default mongoose.model('Stock', stockSchema);
