import PurchasesModel from '../models/Purchases';
import Products from '../models/Products';
import StockController from '../controllers/Stock';

const stock = new StockController();

function addPriceToPurchases(purchases) {
  return purchases.map(purchase => ({
    ...purchase,
    price: purchase.stockEntries.reduce((prev, entry) => prev + (entry.price_per_unit * entry.qty), 0),
  }));
}

export default class Purchases {
  async create({ date, seller, products }) {
    const purchase = new PurchasesModel({
      date,
      seller,
    });

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
    return this.getOne(purchase_id);
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
