import Hapi from 'hapi';
import ClientsRoutes from './routes/clients';
import Client from './models/Clients';
import mongoose from 'mongoose';
import corsHeaders from 'hapi-cors-headers';

const configureServer = () => {
  let server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: 5001
  });

  server.ext('onPreResponse', corsHeaders);

  mongoose.Promise = global.Promise;

  ClientsRoutes(server);

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

