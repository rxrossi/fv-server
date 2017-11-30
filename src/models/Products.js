import mongoose, { Schema } from 'mongoose';
import Stock from '../models/Stock';

export function addPrice(product) {
  if (!product.stock.length) {
    return {
      ...product,
      price: '',
    }
  }
  return {
    ...product,
    price: product.stock.find(entry => entry.qty > 0).price
  }
}

export function addQuantity(product) {
  return {
    ...product,
    quantity: product.stock.reduce((prev, {qty}) => qty + prev, 0),
  }
}

export function addAvgPriceFiveLast(product) {
  if (!product.stock.length) {
    return {
      ...product,
    avgPriceFiveLast: '',
    }
  }

  const fiveLastPurchases = product.stock
    .filter(({ qty }) => qty > 0)
    .slice(0, 5)

  const countOfPrices = fiveLastPurchases.length;

  const avgPrice = fiveLastPurchases
    .reduce((prev, { price }) => prev + price, 0) / countOfPrices

  return {
    ...product,
    avgPriceFiveLast: avgPrice,
  }
}

const productSchema = new Schema({
  name: { type: String, unique: true },
  measure_unit: String,
});

productSchema.virtual('stock', {
  ref: 'Stock',
  localField: '_id',
  foreignField: 'product',
});

// productSchema.populate('stock').virtual('price').get(function() {
//   return addPrice(this.stock)
// });

productSchema.set('toObject', { getters: true, virtuals: true });
productSchema.set('toJSON', { getters: true, virtuals: true });

export default mongoose.model('Product', productSchema);


// productSchema.virtual('quantity').get(function() {
//   return addQuantity(this.stock);
// });

// productSchema.virtual('avgPriceFiveLast').get(function() {
//   return addAvgPriceFiveLast(this.stock);
// });

// productSchema.set('toObject', { getters: true, virtuals: true });
// productSchema.set('toJSON', { getters: true, virtuals: true });

// const stockSchema = new Schema({
//   qty: Number,
//   price: Number,
//   sourceOrDestination: String,
//   date: Date,
// })
