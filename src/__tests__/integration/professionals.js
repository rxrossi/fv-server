import 'isomorphic-fetch'; /* global fetch */
import Professional from '../../models/Professionals';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';

const PROFESSIONALS_URL = 'http://localhost:5001/professionals';
let server;

describe('Professionals Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((sv) => {
        sv.start();
        return sv;
      });

    await Professional.deleteMany({}, (err) => {
      if (err) {
        throw new Error('Could not Professional.deleteMany on DB');
      }
      return true;
    });
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  describe('GET Route', () => {
    it('receives an empty array when no professionals', async () => {
      const answer = await fetch(PROFESSIONALS_URL)
        .then(res => res.json());

      expect(answer).toEqual({
        code: 200,
        body: [],
      });
    });

    it('receives a list of professionals', async () => {
      const professionalsList = [
        { name: 'Mary' },
        { name: 'Carl' },
      ];

      await Professional.collection.insert(professionalsList, (err) => {
        if (err) {
          throw new Error(err);
        }
      });

      const answer = await fetch(PROFESSIONALS_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(2);
      expect(typeof answer.body[0].id).toEqual('string');
      // Response is ordered by name
      expect(answer.body[0].name).toEqual(professionalsList[1].name);
    });
  });

  describe('POST Route', () => {
    it('Can post a professional', async () => {
      const beforeList = await Professional.find((err, professionals) => professionals);
      expect(beforeList.length).toBe(0);

      const professionalExample = {
        name: 'Carl',
      };

      const res = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(resp => resp.json());

      const afterList = await Professional.find((err, professionals) => professionals);
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(professionalExample.name);

      expect(res.code).toEqual(200);
      expect(res.body.name).toEqual(professionalExample.name);
    });

    it('Can\'t post a professional with the same name of a previous professional', async () => {
      const beforeList = await Professional.find((err, professionals) => professionals);
      expect(beforeList.length).toBe(0);

      const professionalExample = {
        name: 'Carl',
      };

      await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(res => res.json());

      const res2 = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(res => res.json());


      const afterList = await Professional.find((err, professionals) => professionals);

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(professionalExample.name);

      // Standard response
      // {
      //  code,
      //  body,
      // }
      expect(res2).toEqual({
        code: 422,
        errors: {
          name: NOT_UNIQUE,
        },
      });
    });
  });

  describe('PUT Route', () => {
    it('updates a professional', async () => {
      // Prepare
      // Insert professional
      const professional = new Professional({ name: 'Mary' });
      await professional.save();

      // Act
      const clientUpdated = {
        id: professional._id,
        name: 'Mary2',
      };

      await fetch(PROFESSIONALS_URL, {
        method: 'PUT',
        body: JSON.stringify(clientUpdated),
      }).then(res => res.json());

      // Assert
      const updatedProfessionalFromServer = await Professional.findById(professional._id);
      expect(updatedProfessionalFromServer.name).toBe('Mary2');
    });
  });

  describe('Delete route', () => {
    it('deletes a professional', async () => {
      // Prepare
      // Insert professional
      const professional = new Professional({ name: 'Mary' });
      await professional.save();
      // Act
      const resp = await fetch(PROFESSIONALS_URL, {
        method: 'DELETE',
        body: JSON.stringify(professional._id),
      }).then(res => res.json());

      // Assert
      const deletedProfessional = await Professional.findById(professional._id);
      expect(resp.code).toBe(204);
      expect(deletedProfessional).toEqual(null);
    });
  });
});
