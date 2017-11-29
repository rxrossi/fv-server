import Stock from '../models/Stock';

export default class StockController {
  getAll() {
    return Stock.find({})
      .populate('product')
      .then(entries=> entries.map(entry => entry.toObject()))
  }
}
