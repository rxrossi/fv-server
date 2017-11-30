import PurchasesModel from '../models/Purchases';
import Products from '../models/Products';
import StockController from '../controllers/Stock';

const stock = new StockController;

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
    return PurchasesModel.findOne({ _id: id }).populate({
      path: 'products',
      populate: {
        path: 'product',
        select: 'name measure_unit'
      }
    });
  }

  getAll() {
    return PurchasesModel
      .find({})
      .populate({
        path: 'products',
        populate: {
          path: 'product',
          select: 'name measure_unit'
        }
      })
      .lean()
      .then((purchases) => {
        return purchases.map((purchase) => {
          return {
            ...purchase,
            price: purchase.products.reduce((prev, entry) => {
              // console.log(prev, entry.price)
              return prev + entry.price
            }, 0),
          }
        })
      })
  }
}
