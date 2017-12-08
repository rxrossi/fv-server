import Stock from '../models/Stock';
import Products from '../controllers/Products';

const products = new Products();

export default class StockController {
  getAll() {
    return Stock.find({})
      .populate('product')
      .then(entries => entries.map(entry => entry.toObject()));
  }

  async create(postBody) {
    let price_per_unit;
    if (postBody.sale) { // Means it is a sale
      const productBeingSold = await products.getOne(postBody.product);
      price_per_unit = productBeingSold.price_per_unit;
    } else {
      price_per_unit = postBody.total_price / postBody.qty;
    }

    const entry = new Stock({
      product: postBody.product,
      purchase: postBody.purchase,
      sale: postBody.sale,
      qty: postBody.qty,
      price_per_unit,
      date: postBody.date,
    });

    await entry.save();

    return entry;
  }
}
