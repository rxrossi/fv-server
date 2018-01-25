import hapiAuthJwt from 'hapi-auth-jwt2';
import Users from './models/Users';

export const jwtSecret = 'a-Random_string_anything';

function validate(decoded, request, callback) {
  Users.findById(decoded.id)
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
