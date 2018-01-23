import User from '../models/Users';
import { NOT_UNIQUE, BLANK } from '../errors';

export default (server) => {
  server.route({
    path: '/users',
    method: 'POST',
    config: { auth: false },
    handler: async (req, res) => {
      const { email, password } = req.payload;
      const errors = {};

      if (!password) {
        errors.password = BLANK;
      }

      // Check if email is duplicated
      await User
        .findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } })
        .then((user) => {
          if (user) {
            errors.email = NOT_UNIQUE;
          }
        });

      if (!email) {
        errors.email = BLANK;
      }

      if (!Object.keys(errors).length) {
        const user = new User(req.payload);
        user.save();
        return res({
          code: 200,
          body: user,
        });
      }

      return res({
        code: 422,
        errors,
      });
    },
  });
};
