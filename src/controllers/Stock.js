import Stock from '../models/Stock';

export default class StockController {
  getAll() {
    return Stock.find({})
      .populate('product')
      .then(entries=> entries.map(entry => entry.toObject()))
  }

  create(product) {
    const entry = new Stock({
      product: product.product,
      purchase: product.purchase,
      qty: product.qty,
      price: product.price,
      date: Date.now(),
    })

    return entry.save((err, entry) => {
      if (err) {
        console.error('Could not save stock entry', err);
      }
      return entry;
    });
  }
}
