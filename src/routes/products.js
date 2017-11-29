import Product from '../models/Products';
import Controller from '../controllers/Products'
import { NOT_UNIQUE, BLANK, INVALID } from '../errors';

const controller = new Controller;

export default (server) => {
  server.route({
    method: 'GET',
    path: '/products',
    handler: async (req, res) => {
      return res({
        code: 200,
        body: await controller.getAll(),
      });
    }
  });

  server.route({
    path: '/products',
    method: 'POST',
    handler: async (req, res) => {
      const { name, measure_unit } = req.payload;
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
        const product = new Product(req.payload);
        product.save();
        return res({
          code: 201,
          body: product,
        });
      }

      return res({
        code: 422, // 409 is conflict
        errors
      });
    }
  });
};
