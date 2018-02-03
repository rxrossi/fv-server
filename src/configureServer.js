import Hapi from 'hapi';
import mongoose from 'mongoose';
import corsHeaders from 'hapi-cors-headers';
import ProductsRoutes from './products/routes';
import ClientsRoutes from './clients/routes';
import ProfessionalsRoutes from './professionals/routes';
import PurchasesRoutes from './purchases/routes';
import SalesRoutes from './sales/routes';
import UsersRoutes from './users/routes';
import AuthRoute from './authRoutes';
import AuthCfg from './auth';

export default async () => {
  const server = new Hapi.Server();

  const port = process.env.PORT || 5001;
  const host = process.env.PORT ? '0.0.0.0' : 'localhost';

  await server.connection({
    host,
    port,
  });

  server.ext('onPreResponse', corsHeaders);

  mongoose.Promise = global.Promise;

  AuthCfg(server);
  ClientsRoutes(server);
  ProductsRoutes(server);
  ProfessionalsRoutes(server);
  PurchasesRoutes(server);
  SalesRoutes(server);
  UsersRoutes(server);
  AuthRoute(server);

  mongoose.Promise = global.Promise;

  const mongodbURL = process.env.MONGODB_URI || 'mongodb://localhost/fv2';

  return mongoose.connect(mongodbURL, { useMongoClient: true })
    .then(() => server);
};
