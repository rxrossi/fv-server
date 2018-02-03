import jwt from 'jwt-simple';
import User from './users/models';
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
              statusCode: 200,
              body: jwt.encode(payload, jwtSecret),
            });
          }
          return res({ statusCode: 401 });
        })
        .catch(() => res({
          statusCode: 500,
          error: 'Could not do this request for a token',
        }));
    },
  });
};
