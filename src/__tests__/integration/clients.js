import 'isomorphic-fetch';
import configureServer from '../../index';

const CLIENTS_URL = 'http://localhost:5001/clients';
let server;

describe('Clients Route', () => {

  beforeEach(async () => {
    server = await configureServer()
    .then((server) => {
      server.start();
      return server;
    });
  })
  afterEach(() => {
    server.stop();
    // database.disconnect();
  })

  it('receives an empty array when no clients', async () => {
    const answer = await fetch(CLIENTS_URL)
      .then(res => res.json())

    expect(answer).toEqual([]);
  });

  xit('receives a list of clients', () => {

  });
})
