import 'isomorphic-fetch'; /* global fetch */
import Professional from '../../models/Professionals';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';
import cleanAndCreateUserAndHeader from '../helpers/cleanUsersCreateUserAndHeader';

const PROFESSIONALS_URL = 'http://localhost:5001/professionals';
let server;
let user;
let headers;

const errHandler = err => (err ? console.error(err) : false);

describe('Professionals Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((sv) => {
        sv.start();
        return sv;
      });

    await Professional.deleteMany({}, errHandler);
    ({ user, headers } = await cleanAndCreateUserAndHeader());
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  describe('GET Route', () => {
    it('receives an empty array when no professionals', async () => {
      const answer = await fetch(PROFESSIONALS_URL, { headers })
        .then(res => res.json());

      expect(answer).toEqual({
        statusCode: 200,
        body: [],
      });
    });

    it('receives a list of professionals', async () => {
      const professionalsList = [
        { name: 'Mary' },
        { name: 'Carl' },
      ];

      await Professional.byTenant(user._id).insertMany(professionalsList, errHandler);

      const answer = await fetch(PROFESSIONALS_URL, { headers })
        .then(res => res.json());

      expect(answer.statusCode).toEqual(200);
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
        headers,
      }).then(resp => resp.json());

      const afterList = await Professional
        .byTenant(user._id)
        .find((err, professionals) => professionals);

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(professionalExample.name);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(professionalExample.name);
    });

    it('Can\'t post a professional with the same name of a previous professional', async () => {
      const beforeList = await Professional
        .byTenant(user._id)
        .find((err, professionals) => professionals);
      expect(beforeList.length).toBe(0);

      const professionalExample = {
        name: 'Carl',
      };

      await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
        headers,
      }).then(res => res.json());

      const res2 = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
        headers,
      }).then(res => res.json());


      const afterList = await Professional.find((err, professionals) => professionals);

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(professionalExample.name);

      // Standard response
      // {
      //  statusCode,
      //  body,
      // }
      expect(res2).toEqual({
        statusCode: 422,
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
      const professional = new Professional({ name: 'Mary', tenantId: user._id });
      await professional.save();

      // Act
      const clientUpdated = {
        id: professional._id,
        name: 'Mary2',
      };

      await fetch(PROFESSIONALS_URL, {
        method: 'PUT',
        body: JSON.stringify(clientUpdated),
        headers,
      }).then(res => res.json());

      // Assert
      const updatedProfessionalFromServer = await Professional
        .byTenant(user._id)
        .findById(professional._id);
      expect(updatedProfessionalFromServer.name).toBe('Mary2');
    });
  });

  describe('Delete route', () => {
    it('deletes a professional', async () => {
      // Prepare
      // Insert professional
      const professional = new Professional({ name: 'Mary', tenantId: user._id });
      await professional.save();

      // Act
      const resp = await fetch(PROFESSIONALS_URL, {
        method: 'DELETE',
        body: JSON.stringify(professional._id),
        headers,
      }).then(res => res.json());

      // Assert
      const deletedProfessional = await Professional.findById(professional._id);
      expect(resp.statusCode).toBe(204);
      expect(deletedProfessional).toEqual(null);
    });
  });
});
