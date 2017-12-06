import Purchases from '../controllers/Purchases';

const controller = new Purchases();

export default (server) => {
  server.route({
    method: 'GET',
    path: '/purchases',
    handler: async (req, res) => {
      const purchases = await controller.getAll();
      return res({
        code: 200,
        body: purchases,
      });
    },
  });

  server.route({
    method: 'POST',
    path: '/purchases',
    handler: async (req, res) => {
      const purchase = await controller.create(req.payload);
      return res({
        code: 201,
        body: purchase,
      });
    },
  });
};

