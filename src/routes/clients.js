import Clients from '../models/Clients';

export default (server) => {
  server.route({
    method: 'GET',
    path: '/clients',
    handler: (req, res) => {
      return res([]);
    }
  });
}
