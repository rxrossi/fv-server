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
  }

  getAll() {
    return PurchasesModel.find({}).populate({
      path: 'products',
      populate: {
        path: 'product',
        select: 'name measure_unit'
      }
    });
  }
}
