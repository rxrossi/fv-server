import jwt from 'jwt-simple';
import Users from '../models/Users';
import { jwtSecret } from '../auth';

export default (server) => {
  server.route({
    method: 'POST',
    path: '/token',
    config: { auth: false },
    handler: async (req, res) => {
      const { email, password } = req.payload;
      await Users.findOne({ email })
        .then((user) => {
          if (user.isPassCorrect(password, user.password)) {
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
