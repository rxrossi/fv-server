import PurchasesModel from '../models/Purchases';
import Products from '../models/Products';
import StockController from '../controllers/Stock';
import { NOT_UNIQUE, BLANK, INVALID, NOT_POSITIVE } from '../errors';

const stock = new StockController();

function addPriceToPurchases(purchases) {
  return purchases.map(purchase => ({
    ...purchase,
    price: purchase.stockEntries.reduce((prev, entry) => prev + (entry.price_per_unit * entry.qty), 0),
  }));
}

export default class Purchases {
  async create({ date, seller, products }) {
    const errors = {};
    const purchase = new PurchasesModel({
      date,
      seller,
    });

    // error cheching
    // for seller
    if (!seller) {
      errors.seller = BLANK;
    }
    // date
    if (!date) {
      errors.date = BLANK;
    }

    const errorOfProducts = [];
    products.forEach(({ id, qty, total_price }) => {
      const errors = {};
      if (!id) {
        errors.id = BLANK;
      }
      if (!(qty > 0)) {
        errors.qty = NOT_POSITIVE;
      }
      if (!(total_price > 0)) {
        errors.total_price = NOT_POSITIVE;
      }

      if (Object.keys(errors).length) {
        errorOfProducts.push(errors);
      }
    });

    if (Object.keys(errors).length || errorOfProducts.length) {
      return {
        errors: {
          ...errors,
          products: errorOfProducts,
        },
      };
    }

    const { id: purchase_id } = await purchase.save();

    await products.map(async (item) => {
      await stock.create({
        product: item.id,
        purchase: purchase_id,
        qty: item.qty,
        total_price: item.total_price,
        date,
      });
    });

    const stockItems = await stock.getAll();

    return {
      purchase: await this.getOne(purchase_id),
    };
  }

  getOne(id) {
    return PurchasesModel.findById(id)
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit',
        },
      })
      .then(purchase => purchase.toObject())
      .then(purchase => addPriceToPurchases([purchase])[0]);
  }

  getAll() {
    return PurchasesModel
      .find({})
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit',
        },
      })
      .then(purchases => purchases.map(purchase => purchase.toObject()))
      .then(purchases => addPriceToPurchases(purchases));
  }
}
