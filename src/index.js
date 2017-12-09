import configureServer from './configureServer';

configureServer()
  .then(server => server.start())
  .then(() => console.log('Server running'));

export default configureServer;

