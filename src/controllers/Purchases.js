import Purchase from '../models/Purchases';
import StockController from './Stock';
import StockModel from '../models/Stock';
import { BLANK, NOT_POSITIVE } from '../errors';

const errLogger = (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(err)
  }
};

const stock = new StockController();

function addTotalPrice(purchases) {
  return purchases.map(purchase => ({
    ...purchase,
    price: purchase.stockEntries
      .reduce((prev, entry) => prev + (entry.price_per_unit * entry.qty), 0),
  }));
}

function hasProductEntriesErrors(products) {
  let errorCount = 0;

  const array = products.map(({ id, qty, total_price }) => {
    const errors = {};
    if (!id) {
      errors.id = BLANK;
      errorCount += 1;
    }
    if (!(qty > 0)) {
      errors.qty = NOT_POSITIVE;
      errorCount += 1;
    }
    if (!(total_price > 0)) {
      errors.total_price = NOT_POSITIVE;
      errorCount += 1;
    }
    return errorCount ? array : null;
  });
}

function hasErrors({ date, seller, products = [] }) {
  const errors = {};
  if (!seller) {
    errors.seller = BLANK;
  }
  if (!date) {
    errors.date = BLANK;
  }
  if (!products.length) {
    errors.emptyProducts = !products.length;
  }

  const productErrors = hasProductEntriesErrors(products);
  if (productErrors) {
    errors.products = productErrors;
  }


  return (Object.keys(errors).length || errors.products) ? errors : null;
}

export default class Purchases {
  constructor(Model = Purchase) {
    this.Model = Model;
  }

  async create(body) {
    const errors = hasErrors(body);
    if (errors) {
      return errors;
    }
    const purchase = new this.Model(body);
    const { id: purchase_id } = await purchase.save();

    body.products.map(async (item) => {
      await stock.create({
        product: item.id,
        purchase: purchase_id,
        qty: item.qty,
        total_price: item.total_price,
        date: body.date,
      });
    });

    return {
      purchase: await this.getOne(purchase_id),
    };
  }

  async update({
    _id, seller, date, products,
  }) {
    const errors = hasErrors({
      _id, seller, date, products,
    });
    if (errors) {
      return {
        errors,
      };
    }

    // update purchase model
    await this.Model.findByIdAndUpdate(_id, { $set: { seller, date } }, { new: true });
    // delete all stock entries related to this purchase
    await StockModel.deleteMany({ purchase: _id });
    // create new entries based on body.products
    products.map(async (item) => {
      await stock.create({
        product: item.id,
        purchase: _id,
        qty: item.qty,
        total_price: item.total_price,
        date,
      });
    });

    return {
      purchase: await this.getOne(_id),
    };
  }

  async delete(id) {
    await StockModel.deleteMany({ purchase: id });
    await this.Model.findByIdAndRemove(id);
  }

  async getOne(id) {
    const purchase = await this.Model.findById(id);

    if (!purchase) {
      return null;
    }

    return this.Model.findById(id)
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit',
        },
      })
      .then(x => x.toObject())
      .then(x => addTotalPrice([x])[0]);
  }

  getAll() {
    return this.Model
      .find({})
      .sort({ date: 'descending' })
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit',
        },
      })
      .then(purchases => purchases.map(purchase => purchase.toObject()))
      .then(purchases => addTotalPrice(purchases));
  }
}
