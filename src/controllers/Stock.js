import Stock from '../models/Stock';

export default class StockController {
  getAll() {
    return Stock.find({})
      .populate('product')
      .then(entries => entries.map(entry => entry.toObject()));
  }

  create(postBody) {
    const entry = new Stock({
      product: postBody.product,
      purchase: postBody.purchase,
      sale: postBody.sale,
      qty: postBody.qty,
      price: postBody.price,
      date: Date.now(),
    });

    return entry.save((err, entry) => {
      if (err) {
        console.error('Could not save stock entry', err);
      }
      // console.log('saved', entry);
      return entry;
    });
  }
}
