import Hapi from 'hapi';
import mongoose from 'mongoose';
import ClientsRoutes from './routes/clients';

export default () => {
  let server = new Hapi.Server();

  server.connection({
    host: 'localhost',
    port: 5001
  });

  mongoose.Promise = global.Promise;

  // MODEL

  const Client = mongoose.model('Client', mongoose.Schema({
    name: { type: String, unique: true },
    phone: String,
  }));

  Client.deleteMany({}, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('deleted everything');
    }
  });

  const mary = new Client({
    name: 'John',
    phone: '998',
  });

  mary.save((err, clientSaved) => {
    if (err) {
      console.log(err);
    } else {
      console.log('saved', clientSaved);
    }
  });

  Client.find((err, clients) => {
    console.log(clients);
  })

  // MODEL.end

  ClientsRoutes(server);

  mongoose.Promise = global.Promise;
  return mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
    .then(() => {
      return server;
    })

}

