import PurchasesModel from '../models/Purchases';
import Products from '../models/Products';
import StockController from '../controllers/Stock';

const stock = new StockController;

function addPriceToPurchases(purchases) {
  return purchases.map((purchase) => {
    return {
      ...purchase,
      price: purchase.stockEntries.reduce((prev, entry) => {
        return prev + entry.price
      }, 0),
    }
  })

}

export default class Purchases {
  async create({ date, seller, products }) {
    const purchase = new PurchasesModel({
      date,
      seller,
    })

    const { id:purchase_id } = await purchase.save();

    products.map(async item => {
      await stock.create({
        product: item.id,
        purchase: purchase_id,
        qty: item.qty,
        price: item.price,
        date,
      })});

    return this.getOne(purchase_id)
  }

  getOne(id) {
    return PurchasesModel.findOne({ _id: id })
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit'
        }
      })
      .then(purchase => addPriceToPurchases([purchase.toObject()])[0])
  }

  getAll() {
    return PurchasesModel
      .find({})
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit'
        }
      })
      .then(purchases => purchases.map(purchase => purchase.toObject()))
      .then((purchases) => addPriceToPurchases(purchases))
  }
}
