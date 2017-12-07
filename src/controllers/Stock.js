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
    let price;
    console.log({ postBody });
    if (postBody.sale) { // Means it is a sale
      const product = await products.getOne(postBody.product);
      price = product.price;
      console.log(product, price);
    } else {
      price = postBody.price;
    }

    return '';

    const entry = new Stock({
      product: postBody.product,
      purchase: postBody.purchase,
      sale: postBody.sale,
      qty: postBody.qty,
      price,
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
