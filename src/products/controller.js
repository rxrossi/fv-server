import Products, { addPrice, addQuantity, addAvgPriceFiveLast } from './model';
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
  constructor(tenantId) {
    this.Model = Products.byTenant(tenantId);
  }

  getAll() {
    return this.Model
      .find({ $or: [{ deleted: false }, { deleted: undefined }] })
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
    return this.Model
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

  async create(body) {
    const { name, measure_unit } = body;
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
    await this.Model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, (err, product) => {
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
      const product = new this.Model({ name, measure_unit });
      const t1 = await product.save(err => true);

      return {
        product,
      };
    }

    return {
      errors,
    };
  }

  async update(product) {
    const { name, measure_unit, _id } = product;
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
    await this.Model.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, (err, prod) => {
      if (err) {
        return console.error('error when finding a product with this name');
      }
      if (prod && prod._id.toString() !== _id) {
        errors.name = NOT_UNIQUE;
      }
    });

    if (!name) {
      errors.name = BLANK;
    }

    if (!Object.keys(errors).length) {
      const productUpdated = await this.Model
        .findByIdAndUpdate(_id, { $set: { name, measure_unit } }, { new: true });
      return {
        product: productUpdated.toObject(),
      };
    }

    return {
      errors,
    };
  }

  async delete(id) {
    const product = await this.Model.findById(id);
    product.name = `${product.name} deativated at ${Date.now()}`;
    await product.save();
    await product.delete();
    return product;
  }
}

export default ProductsController;
