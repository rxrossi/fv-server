import 'isomorphic-fetch';
import Professional from '../../models/Professionals';
import configureServer from '../../index';
import { NOT_UNIQUE } from '../../errors';

const PROFESSIONALS_URL = 'http://localhost:5001/professionals';
let server;

describe('Professionals Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

    await Professional.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Professional.deleteMany on DB";
      }
      return true;
    })
  });

  afterEach((done) => {
    server.stop(done);
  });

  describe('GET Route', () => {
    it('receives an empty array when no professionals', async () => {
      const answer = await fetch(PROFESSIONALS_URL)
        .then(res => res.json())

      expect(answer).toEqual({
        code: 200,
        body: []
      });
    });

    it('receives a list of professionals', async () => {
      const professionalsList = [
        { name: 'Mary' },
        { name: 'Carl' },
      ];

      await Professional.collection.insert(professionalsList, (err) => {
        if (err) {
          console.log(err);
        }
      });

      const answer = await fetch(PROFESSIONALS_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(2);
      expect(answer.body[0].name).toEqual(professionalsList[0].name);
    });
  })

  describe('POST Route', () => {
    it('Can post a professional', async () => {
      const beforeList = await Professional.find((err, professionals) => {
        return professionals;
      });
      expect(beforeList.length).toBe(0);

      const professionalExample = {
        name: 'Carl',
      };

      const res = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(res => res.json());

      const afterList = await Professional.find((err, professionals) => {
        return professionals;
      });
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(professionalExample.name);

      expect(res.code).toEqual(201); //201 means created
      expect(res.body.name).toEqual(professionalExample.name);
    });

    it('Can\'t post a professional with the same name of a previous professional', async () => {
      const beforeList = await Professional.find((err, professionals) => {
        return professionals;
      });
      expect(beforeList.length).toBe(0);

      const professionalExample = {
        name: 'Carl',
      };

      const res1 = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(res => res.json())

      const res2 = await fetch(PROFESSIONALS_URL, {
        method: 'POST',
        body: JSON.stringify(professionalExample),
      }).then(res => res.json());


      const afterList = await Professional.find((err, professionals) => {
        return professionals;
      });

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
  })
});
