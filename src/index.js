import configureServer from './configureServer';

configureServer().then((server) => {
  server.start();
});

export default configureServer;

