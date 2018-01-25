import Hapi from 'hapi';
import mongoose from 'mongoose';
import corsHeaders from 'hapi-cors-headers';
import ProductsRoutes from './routes/products';
import ClientsRoutes from './routes/clients';
import ProfessionalsRoutes from './routes/professionals';
import PurchasesRoutes from './routes/purchases';
import SalesRoutes from './routes/sales';
import UsersRoutes from './routes/users';
import AuthRoute from './routes/auth';
import AuthCfg from './auth';

export default async () => {
  const server = new Hapi.Server();

  await server.connection({
    host: 'localhost',
    port: 5001,
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

  return mongoose.connect('mongodb://localhost/fv2', { useMongoClient: true })
    .then(() => server);
};
