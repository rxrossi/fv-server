import Product from '../models/Products';
import { NOT_UNIQUE, BLANK } from '../errors';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/products',
    handler: async (req, res) => {
      await Product.find((err, products) => {
        if (err) {
          return res({
            code: 500,
            error: 'Could not fetch products',
          });
        }
        return res({
          code: 200,
          body: products
        });
      })
    }
  });

  server.route({
    path: '/products',
    method: 'POST',
    handler: async (req, res) => {
      const { name, measure_unit } = req.payload;
      const errors = {};

      if (!measure_unit) {
        errors.measure_unit = BLANK;
      }

      if (!name) {
        errors.name = BLANK;
      }

      //Check if name is duplicated
      const notUniqueName = await Product.findOne({ name }, (err, product) => {
        if (err) {
          return console.error('error when finding a product with this name');
        }
        return product;
      });

      if (notUniqueName) {
        errors.name = NOT_UNIQUE;
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
}
