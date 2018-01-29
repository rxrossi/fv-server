import NonTenant from './model';
import { NOT_UNIQUE, BLANK } from '../errors';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: async (req, res) => {
      const Client = NonTenant.byTenant(req.auth.credentials.id);
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
    method: 'DELETE',
    path: '/clients',
    handler: async (req, res) => {
      const Client = NonTenant.byTenant(req.auth.credentials.id);
      await Client.findByIdAndRemove(req.payload)
        .then(() => res({
          code: 204,
        }))
        .catch(() => res({
          code: 500,
        }));
    },
  });

  server.route({
    path: '/clients',
    method: 'PUT',
    handler: async (req, res) => {
      const Client = NonTenant.byTenant(req.auth.credentials.id);
      const { name, phone, id } = req.payload;
      const errors = {};

      if (!phone) {
        errors.phone = BLANK;
      }

      // Check if name is duplicated
      await Client
        .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .then((client) => {
          if (client && client._id.toString() !== id) {
            errors.name = NOT_UNIQUE;
          }
        });

      if (!name) {
        errors.name = BLANK;
      }

      if (!Object.keys(errors).length) {
        const client = await Client.findById(id);
        client.name = name;
        client.phone = phone;
        await client.save();
        return res({
          code: 200,
          body: client,
        });
      }

      return res({
        code: 422, // 409 is conflict
        errors,
      });
    },
  });

  server.route({
    path: '/clients',
    method: 'POST',
    handler: async (req, res) => {
      const Client = NonTenant.byTenant(req.auth.credentials.id);
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
          code: 200,
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
