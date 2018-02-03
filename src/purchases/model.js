import mongoose, { Schema } from 'mongoose';
import mongoTenant from 'mongo-tenant';

const purchasesSchema = Schema({
  seller: { type: String, required: true },
  date: { type: Date, required: true },
});

purchasesSchema.virtual('stockEntries', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'purchase',
});

purchasesSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

purchasesSchema.set('toObject', { getters: true, virtuals: true });
purchasesSchema.set('toJSON', { getters: true, virtuals: true });
purchasesSchema.plugin(mongoTenant);

export default mongoose.model('Purchases', purchasesSchema);
