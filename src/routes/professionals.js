import Professional from '../models/Professionals';
import { NOT_UNIQUE, BLANK } from '../errors';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/professionals',
    handler: async (req, res) => {
      await Professional.find()
        .collation({ locale: 'en', strength: 2 }).sort({ name: 1 })
        .then(professionals => res({
          code: 200,
          body: professionals,
        }))
        .catch(() => res({
          code: 500,
          error: 'Could not fetch professionals',
        }));
    },
  });

  server.route({
    path: '/professionals',
    method: 'PUT',
    handler: async (req, res) => {
      const { name, id } = req.payload;
      const errors = {};

      // Check if name is duplicated
      await Professional
        .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .then((professional) => {
          if (professional && professional._id.toString() !== id) {
            errors.name = NOT_UNIQUE;
          }
        });

      if (!name) {
        errors.name = BLANK;
      }

      if (!Object.keys(errors).length) {
        const professional = await Professional.findById(id);
        professional.name = name;
        await professional.save();
        return res({
          code: 200,
          body: professional,
        });
      }

      return res({
        code: 422, // 409 is conflict
        errors,
      });
    },
  });

  server.route({
    method: 'DELETE',
    path: '/professionals',
    handler: async (req, res) => {
      await Professional.findByIdAndRemove(req.payload)
        .then(() => res({
          code: 204,
        }))
        .catch(() => res({
          code: 500,
        }));
    },
  });

  server.route({
    path: '/professionals',
    method: 'POST',
    handler: async (req, res) => {
      const { name } = req.payload;
      const errors = {};

      // Check if name is duplicated
      await Professional
        .findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
        .then((professional) => {
          if (professional) {
            errors.name = NOT_UNIQUE;
          }
        });

      if (!name) {
        errors.name = BLANK;
      }

      if (!Object.keys(errors).length) {
        const professional = new Professional(req.payload);
        professional.save();
        return res({
          code: 201,
          body: professional,
        });
      }

      return res({
        code: 422, // 409 is conflict
        errors,
      });
    },
  });
};
