import User from './models';
import { NOT_UNIQUE, BLANK, UNMATCHED_PW } from '../errors';

export default (server) => {
  server.route({
    path: '/users',
    method: 'POST',
    config: { auth: false },
    handler: async (req, res) => {
      const { email, password, confirmPassword } = req.payload;
      const errors = {};

      if (password !== confirmPassword) {
        errors.password = UNMATCHED_PW;
        errors.confirmPassword = UNMATCHED_PW;
      }

      if (!password) {
        errors.password = BLANK;
      }

      if (!confirmPassword) {
        errors.confirmPassword = BLANK;
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
          statusCode: 200,
          body: user,
        });
      }

      return res({
        statusCode: 422,
        errors,
      });
    },
  });
};
