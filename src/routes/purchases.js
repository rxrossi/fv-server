import Purchases from '../controllers/Purchases';
import { NOT_UNIQUE, BLANK } from '../errors';

const controller = new Purchases;

export default (server) => {
  server.route({
    method: 'GET',
    path: '/purchases',
    handler: async (req, res) => {
      const purchases = await controller.getAll();
      return res({
        code: 200,
        body: purchases
      });
    }
  })
}
