import 'isomorphic-fetch';
import Purchase from '../../models/Purchases';
import configureServer from '../../index';
import { NOT_UNIQUE } from '../../errors';

const PURCHASES_URL = 'http://localhost:5001/purchases';
let server;

describe('Purchases Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

    await Purchase.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Purchase.deleteMany on DB";
      }
      return true;
    })
  });

  afterEach((done) => {
    server.stop(done);
  });

  describe('GET Route', () => {
    it.only('receives an empty array when no purchases', async () => {
      const answer = await fetch(PURCHASES_URL)
        .then(res => res.json())

      expect(answer).toEqual({
        code: 200,
        body: []
      });
    });

    it('receives a list of purchases', async () => {
      const purchasesList = [
        { name: 'Mary' },
        { name: 'Carl' },
      ];

      await Purchase.collection.insert(purchasesList, (err) => {
        if (err) {
          console.log(err);
        }
      });

      const answer = await fetch(PURCHASES_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(2);
      expect(answer.body[0].name).toEqual(purchasesList[0].name);
    });
  })

  describe('POST Route', () => {
    it('Can post a purchase', async () => {
      const beforeList = await Purchase.find((err, purchases) => {
        return purchases;
      });
      expect(beforeList.length).toBe(0);

      const purchaseExample = {
        name: 'Carl',
      };

      const res = await fetch(PURCHASES_URL, {
        method: 'POST',
        body: JSON.stringify(purchaseExample),
      }).then(res => res.json());

      const afterList = await Purchase.find((err, purchases) => {
        return purchases;
      });
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(purchaseExample.name);

      expect(res.code).toEqual(201); //201 means created
      expect(res.body.name).toEqual(purchaseExample.name);
    });
  })
});
