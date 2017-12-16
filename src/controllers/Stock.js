import Stock from '../models/Stock';
import Products from '../controllers/Products';

const products = new Products();

export const addSourceOrDestination = (entry) => {
  const sourceOrDestination = {};


  if (entry.sale) {
    sourceOrDestination.name = `${entry.sale.name} (${entry.sale.client.name})`;
    sourceOrDestination.sale_id = entry.sale._id;
  }
  if (entry.purchase) {
    sourceOrDestination.seller = `${entry.purchase.seller}`;
    sourceOrDestination.purchase_id = entry.purchase._id;
  }

  return {
    ...entry,
    sourceOrDestination,
  };
};

export default class StockController {
  getAll() {
    return Stock.find({})
      .populate({
        path: 'sale',
        populate: {
          path: 'client',
        },
      })
      .populate('product')
      .populate('purchase')
      .then(entries => entries.map(entry => entry.toObject()))
      .then(entries => entries.map(entry => addSourceOrDestination(entry)));
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
