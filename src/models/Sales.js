import mongoose, { Schema } from 'mongoose';
import Product from '../models/Products';
import Stock from '../models/Stock';
import Client from '../models/Clients';
import Professional from '../models/Professionals';

const salesSchema = Schema({
  name: { type: String, required: true },
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  professional: { type: Schema.Types.ObjectId, ref: 'Professional' },
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  date: { type: Date, required: true },
  payment: {
    value_total: { type: Number, required: true },
    value_liquid: { type: Number, required: true },
    method: { type: String, required: true },
    discount: { type: String, required: true }, // Ex.: value - 11%
    avaiable_at: { type: Date, required: true },
  },
});

salesSchema.virtual('stockEntries', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'sale',
});

salesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

salesSchema.set('toObject', { getters: true, virtuals: true });
salesSchema.set('toJSON', { getters: true, virtuals: true });

export default mongoose.model('Sales', salesSchema);
