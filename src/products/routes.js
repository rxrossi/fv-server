import Controller from '../products/controller';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/products',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      res({
        code: 200,
        body: await controller.getAll(),
      });
    },
  });

  server.route({
    path: '/products',
    method: 'PUT',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const { product, errors } = await controller.update(req.payload);

      if (errors) {
        return res({
          code: 422, // 409 is conflict
          errors,
        });
      }

      return res({
        code: 200,
        body: product,
      });
    },
  });

  server.route({
    path: '/products',
    method: 'DELETE',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const { errors } = await controller.delete(req.payload);

      if (errors) {
        return res({
          code: 422, // 409 is conflict
          errors,
        });
      }

      return res({
        code: 204,
      });
    },
  });

  server.route({
    path: '/products',
    method: 'POST',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const { product, errors } = await controller.create(req.payload);

      if (errors) {
        return res({
          code: 422, // 409 is conflict
          errors,
        });
      }

      return res({
        code: 200,
        body: product,
      });
    },
  });
};
