import mongoose, { Schema } from 'mongoose';

const stockSchema = new Schema({
  qty: Number,
  price: Number,
  sourceOrDestination: String,
  date: Date,
})

stockSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

stockSchema.set('toJSON', {
    virtuals: true
});

const productSchema = new Schema({
  name: { type: String, unique: true },
  measure_unit: String,
  stock: [stockSchema]
});

productSchema.virtual('price').get(function() {
  if (!this.stock.length) {
    return "";
  }
  return this.stock.find(entry => entry.qty > 0).price
})

productSchema.virtual('quantity').get(function() {
  return this.stock.reduce((prev, {qty}) => qty + prev, 0)
})

productSchema.virtual('avgPriceFiveLast').get(function() {
  if (!this.stock.length) {
    return "";
  }

  const fiveLastPurchases = this.stock
    .filter(({ qty }) => qty > 0)
    .slice(0, 5)

  const countOfPrices = fiveLastPurchases.length;

  return fiveLastPurchases
    .reduce((prev, { price }) => prev + price, 0) / countOfPrices
})

productSchema.set('toObject', { getters: true, virtuals: true });
productSchema.set('toJSON', { getters: true, virtuals: true });

export default mongoose.model('Product', productSchema);
