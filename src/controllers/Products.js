import Product, { addPrice, addQuantity, addAvgPriceFiveLast } from '../models/Products';
import { NOT_UNIQUE, BLANK, INVALID } from '../errors';
// import { addSourceOrDestination } from '../controllers/Stock';

const addSourceOrDestination = (entry) => {
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

class ProductsController {
  getAll() {
    return Product
      .find({})
      .collation({ locale: 'en', strength: 2 }).sort({ name: 1 })
      .populate({
        path: 'stock',
        populate: {
          path: 'sale',
          populate: {
            path: 'client',
          },
        },
      })
      .populate({
        path: 'stock',
        populate: {
          path: 'purchase',
        },
      })
      .then(products => products.map(product => product.toObject()))
      .then(products => products.map(product =>
        ({
          ...product,
          stock: product.stock.map(entry => addSourceOrDestination(entry)),
        })))
      .then(products => products.map(product => addPrice(product)))
      .then(products => products.map(product => addQuantity(product)))
      .then(products => products.map(product => addAvgPriceFiveLast(product)));
  }

  getOne(id) {
    return Product
      .findById(id)
      .populate({
        path: 'stock',
        populate: {
          path: 'sale',
        },
      })
      .populate({
        path: 'stock',
        populate: {
          path: 'purchase',
        },
      })
      .then(product => product.toObject())
    // .then(product => addSourceOrDestination(product))
      .then(product => addPrice(product))
      .then(product => addQuantity(product))
      .then(product => addAvgPriceFiveLast(product));
  }

  async create(product) {
    const { name, measure_unit } = product;
    const errors = {};

    const validMeasureUnits = [
      'ml', 'unit', 'mg',
    ];

    if (!validMeasureUnits.includes(measure_unit)) {
      errors.measure_unit = INVALID;
    }

    if (!measure_unit) {
      errors.measure_unit = BLANK;
    }

    // Check if name is duplicated
    await Product.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, (err, product) => {
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
        product,
      };
    }

    return {
      errors,
    };
  }
}

export default ProductsController;
