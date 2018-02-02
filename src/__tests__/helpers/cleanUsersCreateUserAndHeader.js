import jwt from 'jwt-simple';
import { jwtSecret } from '../../auth';
import User from '../../models/User';

const errHandler = err => (err ? console.error(err) : false);


export default async () => {
  await User.deleteMany({}, errHandler);

  const user = new User({
    email: 'user@mail.com',
    password: 'validpass',
  });

  await user.save(errHandler);

  const headers = {
    'Content-Type': 'application/json',
    authorization: jwt.encode({ id: user._id }, jwtSecret),
  };

  return {
    user,
    headers,
  };
};
