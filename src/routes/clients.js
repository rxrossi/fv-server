import Client from '../models/Clients';
import { NOT_UNIQUE, BLANK } from '../errors';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: async (req, res) => {
      await Client.find()
        .collation({ locale: 'en', strength: 2 }).sort({ name: 1 })
        .then(clients => res({
          code: 200,
          body: clients,
        }))
        .catch(() => res({
          code: 500,
          error: 'Could not fetch clients',
        }));
    },
  });

  server.route({
    path: '/clients',
    method: 'POST',
    handler: async (req, res) => {
      const { name, phone } = req.payload;
      const errors = {};

      if (!phone) {
        errors.phone = BLANK;
      }

      // Check if name is duplicated
      await Client
        .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .then((client) => {
          if (client) {
            errors.name = NOT_UNIQUE;
          }
        });

      if (!name) {
        errors.name = BLANK;
      }

      if (!Object.keys(errors).length) {
        const client = new Client(req.payload);
        client.save();
        return res({
          code: 201,
          body: client,
        });
      }

      return res({
        code: 422, // 409 is conflict
        errors,
      });
    },
  });
};
