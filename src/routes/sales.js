import SalesController from '../controllers/Sales';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/sales',
    handler: async (req, res) => {
      const controller = new SalesController(req.auth.credentials.id);
      const sales = await controller.getAll();
      return res({
        code: 200,
        body: sales,
      });
    },
  });

  server.route({
    method: 'DELETE',
    path: '/sales',
    handler: async (req, res) => {
      const controller = new SalesController(req.auth.credentials.id);
      const { errors } = await controller.delete(req.payload);
      if (errors) {
        return res({
          code: 422,
          errors,
        });
      }
      return res({
        code: 204,
      });
    },
  });

  server.route({
    method: 'PUT',
    path: '/sales',
    handler: async (req, res) => {
      const controller = new SalesController(req.auth.credentials.id);
      const { sale, errors } = await controller.update(req.payload);
      if (errors) {
        return res({
          code: 422,
          errors,
        });
      }
      return res({
        code: 200,
        body: sale,
      });
    },
  });

  server.route({
    method: 'POST',
    path: '/sales',
    handler: async (req, res) => {
      const controller = new SalesController(req.auth.credentials.id);
      const { sale, errors } = await controller.create(req.payload);
      if (errors) {
        return res({
          code: 422,
          errors,
        });
      }
      return res({
        code: 200,
        body: sale,
      });
    },
  });
};
