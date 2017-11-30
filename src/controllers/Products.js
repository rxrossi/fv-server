import Product, { addPrice, addQuantity, addAvgPriceFiveLast } from '../models/Products';
import Stock from '../models/Stock';
import { NOT_UNIQUE, BLANK, INVALID } from '../errors';

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

  async create(product) {
    const { name, measure_unit } = product;
    const errors = {};

    const validMeasureUnits = [
      "ml", "unit", "mg"
    ];

    if (!validMeasureUnits.includes(measure_unit)) {
      errors.measure_unit = INVALID;
    }

    if (!measure_unit) {
      errors.measure_unit = BLANK;
    }

    // Check if name is duplicated
    await Product.findOne({ "name": { $regex : new RegExp(name, "i") } }, (err, product) => {
      if (err) {
        return console.error('error when finding a product with this name');
      }
      if (product) {
        errors.name = NOT_UNIQUE;
      }
    });

    if (!name) {
      errors.name = BLANK;
    }

    if (!Object.keys(errors).length) {
      const product = new Product({ name, measure_unit });
      await product.save();

      return {
       product
      };
    }

    return {
      errors
    };
  }

}

export default ProductsController
