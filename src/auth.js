import hapiAuthJwt from 'hapi-auth-jwt2';
import User from './models/User';

export const jwtSecret = process.env.JWT_SECRET || 'a-Random_string_anything';

function validate(decoded, request, callback) {
  User.findById(decoded.id)
    .then((user) => {
      if (user) {
        return callback(null, true);
      }
      return callback(null, false);
    });
}

export default (server) => {
  server.register(hapiAuthJwt, (err) => {
    if (err) {
      throw err;
    }

    server.auth.strategy(
      'jwt', 'jwt', true,
      {
        key: jwtSecret,
        validateFunc: validate,
        verifyOptions: { algorithms: ['HS256'] },
      },
    );
  });
};
