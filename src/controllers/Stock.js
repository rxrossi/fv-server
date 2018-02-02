import Stock from '../models/Stock';
import Products from '../products/controller';

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
  constructor(tenantId, Model = Stock) {
    this.Model = Model.byTenant(tenantId);
    this.Products = new Products(tenantId);
  }

  getAll() {
    return this.Model.find({})
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
    const price_per_unit =
    postBody.sale ?
      await this.Products.getOne(postBody.product).then(x => x.price_per_unit) :
      postBody.total_price / postBody.qty;

    return new this.Model({
      product: postBody.product,
      purchase: postBody.purchase,
      sale: postBody.sale,
      qty: postBody.qty,
      price_per_unit,
      date: postBody.date,
    }).save();
  }
}
