import jwt from 'jwt-simple';
import User from './users/routes';
import { jwtSecret } from './auth';

export default (server) => {
  server.route({
    method: 'POST',
    path: '/token',
    config: { auth: false },
    handler: async (req, res) => {
      const { email, password } = req.payload;
      await User.findOne({ email })
        .then((user) => {
          if (user && user.isPassCorrect(password, user.password)) {
            const payload = { id: user._id };
            return res({
              code: 200,
              body: jwt.encode(payload, jwtSecret),
            });
          }
          return res({ code: 401 });
        })
        .catch(() => res({
          code: 500,
          error: 'Could not do this request for a token',
        }));
    },
  });
};
