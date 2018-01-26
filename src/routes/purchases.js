import Controller from '../controllers/Purchases';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/purchases',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const purchases = await controller.getAll();
      return res({
        code: 200,
        body: purchases,
      });
    },
  });

  server.route({
    method: 'DELETE',
    path: '/purchases',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
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
    path: '/purchases',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const { purchase, errors } = await controller.update(req.payload);
      if (errors) {
        return res({
          code: 422,
          errors,
        });
      }
      return res({
        code: 200,
        body: purchase,
      });
    },
  });

  server.route({
    method: 'POST',
    path: '/purchases',
    handler: async (req, res) => {
      const controller = new Controller(req.auth.credentials.id);
      const { purchase, errors } = await controller.create(req.payload);
      if (errors) {
        return res({
          code: 422, // 409 is conflict
          errors,
        });
      }

      return res({
        code: 200,
        body: purchase,
      });
    },
  });
};

