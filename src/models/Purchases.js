import mongoose, { Schema } from 'mongoose';
import Product from '../models/Products';

const purchasesSchema = Schema({
  stock: [{ type: Schema.Types.ObjectId, ref: 'Products' }],
  seller: { type: String, required: true },
  date: { type: Date, required: true },
});

purchasesSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

purchasesSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.model('Purchases', purchasesSchema);
