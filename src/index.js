import Hapi from 'hapi';
import ProductsRoutes from './routes/products';
import ClientsRoutes from './routes/clients';
import ProfessionalsRoutes from './routes/professionals';
import PurchasesRoutes from './routes/purchases';
import mongoose from 'mongoose';
import corsHeaders from 'hapi-cors-headers';

const configureServer = async () => {
  let server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: 5001
  });

  server.ext('onPreResponse', corsHeaders);

  mongoose.Promise = global.Promise;

  ClientsRoutes(server);
  ProductsRoutes(server);
  ProfessionalsRoutes(server);
  PurchasesRoutes(server);

  mongoose.Promise = global.Promise;
  return mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
    .then(() => {
      return server;
    })

}

configureServer().then((server) => {
  server.start();
});

export default configureServer;

