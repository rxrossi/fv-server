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
      const { product, errors } = await controller.create(req.payload);

      if (errors) {
        return res({
          code: 422, // 409 is conflict
          errors
        });
      }

      return res({
        code: 201,
        body: product,
      });
    }
  });
};
