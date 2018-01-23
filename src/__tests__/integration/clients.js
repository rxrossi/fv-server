import 'isomorphic-fetch'; /* global fetch */
import Client from '../../models/Clients';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';

const CLIENTS_URL = 'http://localhost:5001/clients';
let server;

const errHandler = err => (err ? console.error(err) : false);

describe('Clients Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((sv) => {
        sv.start();
        return sv;
      });

    await Client.deleteMany({}, errHandler);
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  describe('GET Route', () => {
    it('receives an empty array when no clients', async () => {
      const answer = await fetch(CLIENTS_URL)
        .then(res => res.json());

      expect(answer).toEqual({
        code: 200,
        body: [],
      });
    });

    it('receives a list of clients', async () => {
      const clientsList = [
        { name: 'John', phone: '999 888 7777' },
        { name: 'Mary', phone: '999 777 6666' },
      ];

      await Client.collection.insert(clientsList, errHandler);

      const answer = await fetch(CLIENTS_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(2);
      expect(answer.body[0].name).toEqual(clientsList[0].name);
    });
  });

  describe('POST Route', () => {
    it('Can post a client', async () => {
      const beforeList = await Client.find((err, clients) => clients);
      expect(beforeList.length).toBe(0);

      const john = {
        name: 'John',
        phone: '999',
      };

      const res = await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(resp => resp.json());

      const afterList = await Client.find((err, clients) => clients);
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(john.name);

      expect(res.code).toEqual(200);
      expect(res.body.name).toEqual(john.name);
    });

    it('Can\'t post a client with the same name of a previous client', async () => {
      const beforeList = await Client.find((err, clients) => clients);
      expect(beforeList.length).toBe(0);

      const john = {
        name: 'John',
        phone: '999',
      };

      await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(res => res.json());

      const res2 = await fetch(CLIENTS_URL, {
        method: 'POST',
        body: JSON.stringify(john),
      }).then(res => res.json());


      const afterList = await Client.find((err, clients) => clients);

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(john.name);

      expect(res2).toEqual({
        code: 422,
        errors: {
          name: NOT_UNIQUE,
        },
      });
    });
  });

  describe('PUT Route', () => {
    it('updates a client', async () => {
      // Prepare
      // Insert client
      const client = new Client({ name: 'Mary', phone: '999 777 6666' });
      await client.save();

      // Act
      const clientUpdated = {
        id: client._id,
        name: 'Mary2',
        phone: client.phone,
      };

      await fetch(CLIENTS_URL, {
        method: 'PUT',
        body: JSON.stringify(clientUpdated),
      }).then(res => res.json());

      // Assert
      const updatedClientFromServer = await Client.findById(client._id);
      expect(updatedClientFromServer.name).toBe('Mary2');
    });
  });

  describe('Delete route', () => {
    it('deletes a client', async () => {
      // Prepare
      // Insert client
      const client = new Client({ name: 'Mary', phone: '999 777 6666' });
      await client.save();
      // Act
      const resp = await fetch(CLIENTS_URL, {
        method: 'DELETE',
        body: JSON.stringify(client._id),
      }).then(res => res.json());

      // Assert
      const deletedClient = await Client.findById(client._id);
      expect(resp.code).toBe(204);
      expect(deletedClient).toEqual(null);
    });
  });
});
