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
    method: 'POST',
    handler: async (req, res) => {
      const { name, phone } = req.payload;
      const errors = {};

      // Check if name is duplicated
      await Professional.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }, (err, professional) => {
        if (err) {
          return console.error('error when finding a professional with this name');
        }
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
