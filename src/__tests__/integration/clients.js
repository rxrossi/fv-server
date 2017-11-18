import 'isomorphic-fetch';
import Client from '../../models/Clients';
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

    Client.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Client.deleteMany on DB";
      }
    })
  });

  afterEach(() => {
    server.stop();
  });

  describe('GET Route', () => {
    it('receives an empty array when no clients', async () => {
      const answer = await fetch(CLIENTS_URL)
        .then(res => res.json())

      expect(answer).toEqual([]);
    });

    it('receives a list of clients', async () => {
      const clientsList = [
        { name: 'John', phone: '999 888 7777' },
        { name: 'Mary', phone: '999 777 6666' },
      ];

      await Client.collection.insert(clientsList, (err) => {
        if (err) {
          console.log(err);
        }
      });

      const answer = await fetch(CLIENTS_URL)
        .then(res => res.json());

      expect(answer.length).toEqual(2);
      expect(answer[0].name).toEqual(clientsList[0].name);
    });
  });

  describe('POST Route', () => {
    it('Can post a client', async () => {
      const beforeList = await Client.find((err, clients) => {
        return clients;
      });
      expect(beforeList.length).toBe(0);

      const john = {
        name: 'John',
        phone: '999',
      };

      await fetch(CLIENTS_URL, {
        body: JSON.stringify(john),
        method: 'POST',
      }).then(res => res.json());

      const afterList = await Client.find((err, clients) => {
        return clients;
      });
      expect(afterList.length).toBe(1);
    })
  })
});
