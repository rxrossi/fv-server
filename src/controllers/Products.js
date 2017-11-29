import Product, { addPrice, addQuantity, addAvgPriceFiveLast } from '../models/Products';
import Stock from '../models/Stock';

class ProductsController {
  getAll() {
    return Product
      .find({})
      .populate('stock')
      .then(products=> products.map(product => product.toObject()))
      .then(products=> products.map(product => addPrice(product)))
      .then(products=> products.map(product => addQuantity(product)))
      .then(products=> products.map(product => addAvgPriceFiveLast(product)))
  }
}

export default ProductsController
