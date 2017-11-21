import Client from '../models/Clients';
import { NOT_UNIQUE } from '../errors';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: async (req, res) => {
      await Client.find((err, clients) => {
        if (err) {
          return res('');
        }
        return res(clients);
      })
    }
  });

  server.route({
    path: '/clients',
    method: 'POST',
    handler: async (req, res) => {
      const { name, phone } = req.payload;
      const errors = [];

      // Check if name is duplicated
      const notUniqueName = await Client.findOne({ name }, (err, client) => {
        if (err) {
          return console.error('error when finding a client with this name');
        }
        return client;
      });

      if (notUniqueName) {
        errors.push({ name: NOT_UNIQUE })
      }

      if (!errors.length) {
        const client = new Client(req.payload);
        client.save();
        return res({
          code: 201,
          body: client,
        });
      }

      return res({
        code: 409, // 409 is conflict
        errors
      });
    }
  });
}
