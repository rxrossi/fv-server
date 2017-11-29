import mongoose, { Schema } from 'mongoose';

const stockSchema = Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Products' },
  sale: { type: Schema.Types.ObjectId, ref: 'Products' },
  purchase: { type: Schema.Types.ObjectId, ref: 'Products' },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
});

stockSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

stockSchema.set('toJSON', {
    virtuals: true
});

export default mongoose.model('Stock', stockSchema);
