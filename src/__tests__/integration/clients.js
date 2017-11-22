import 'isomorphic-fetch';
import Client from '../../models/Clients';
import configureServer from '../../index';
import { NOT_UNIQUE } from '../../errors';

const CLIENTS_URL = 'http://localhost:5001/clients';
let server;

describe('Clients Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

    await Client.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Client.deleteMany on DB";
      }
      return true;
    })
  });

  afterEach((done) => {
    server.stop(done);
  });

  describe('GET Route', () => {
    it('receives an empty array when no clients', async () => {
      const answer = await fetch(CLIENTS_URL)
        .then(res => res.json())

      expect(answer).toEqual({
        code: 200,
        body: []
      });
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

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(2);
      expect(answer.body[0].name).toEqual(clientsList[0].name);
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

      const res = await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(res => res.json());

      const afterList = await Client.find((err, clients) => {
        return clients;
      });
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(john.name);

      expect(res.code).toEqual(201); //201 means created
      expect(res.body.name).toEqual(john.name);
    });

    it('Can\'t post a client with the same name of a previous client', async () => {
      const beforeList = await Client.find((err, clients) => {
        return clients;
      });
      expect(beforeList.length).toBe(0);

      const john = {
        name: 'John',
        phone: '999',
      };

      const res1 = await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(res => res.json())

      const res2 = await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(res => res.json());


      const afterList = await Client.find((err, clients) => {
        return clients;
      });

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(john.name);

      // Standard response
      // {
      //  code,
      //  body,
      // }
      expect(res2).toEqual({
        code: 409,
        errors: {
          name: NOT_UNIQUE,
        },
      });

    });
  });
});
