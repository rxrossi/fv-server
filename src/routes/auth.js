import jwt from 'jwt-simple';
import Users from '../models/Users';
import { jwtSecret } from '../auth';

export default (server) => {
  server.route({
    method: 'POST',
    path: '/token',
    config: { auth: 'jwt' },
    handler: async (req, res) => {
      const { email, password } = req.body;
      await Users.findOne({ email })
        .then((user) => {
          if (user.isPassCorrect(password, user.password)) {
            const payload = { id: user._id };
            res.json({
              token: jwt.encode(payload, jwtSecret),
            });
          } else {
            res({ code: 401 });
          }
        })
        .catch(() => res({
          code: 500,
          error: 'Could not fetch user',
        }));
    },
  });
};
