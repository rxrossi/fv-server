import SalesController from '../controllers/Sales';

const controller = new SalesController();

export default (server) => {
  server.route({
    method: 'GET',
    path: '/sales',
    handler: async (req, res) => {
      const sales = await controller.getAll();
      return res({
        code: 200,
        body: sales,
      });
    },
  });

  server.route({
    method: 'POST',
    path: '/sales',
    handler: async (req, res) => {
      const sale = await controller.create(req.payload);
      return res({
        code: 201,
        body: sale,
      });
    },
  });
};
