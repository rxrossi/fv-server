import Client from '../models/Clients';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: async (req, res) => {
      await Client.find((err, clients) => {
        if (err) {
          return res('');
        }
        return res(clients);
      })
    }
  });

  server.route({
    method: 'POST',
    path: '/clients',
    handler: (req, res) => {
      const client = new Client(req.payload);
      client.save();
      return res(client);
    }
  });
}
