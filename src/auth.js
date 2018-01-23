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

    server.auth.default('jwt');
  });
};

// export default () => {
//   const opts = {
//     secretOrKey: jwtSecret,
//     jwtFromRequest: ExtractJwt.fromAuthHeader(),
//   };

//   const strategy = new Strategy(opts, (payload, done) => {
//     Users.findById(payload.id)
//       .then((user) => {
//         if (user) {
//           return done(null, { id: user._id });
//         }
//         return done(null, false);
//       })
//       .catch(err => done(err, null));
//   });
//   passport.use(strategy);

//   return {
//     initialize: () => passport.initialize(),
//     authenticate: () => passport.authenticate('jwt', { session: false }),
//   };
// };
