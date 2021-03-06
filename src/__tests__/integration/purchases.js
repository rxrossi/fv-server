import 'isomorphic-fetch'; /* global fetch */
import PurchasesModel from '../../purchases/model';
import ProductModel from '../../products/model';
import StockModel from '../../stock/model';
import PurchasesController from '../../purchases/controller';
import configureServer from '../../configureServer';
import { BLANK, NOT_POSITIVE } from '../../errors';
import cleanAndCreateUserAndHeader from '../../testHelpers/cleanUsersCreateUserAndHeader';

const PURCHASES_URL = 'http://localhost:5001/purchases';
let server;
let user;
let headers;

const genericErrorHandler = (err) => {
  if (err) {
    throw new Error(err);
  }
};

describe('Purchases Route', () => {
  let ox;
  let shampoo;

  beforeEach(async () => {
    server = await configureServer()
      .then((sv) => {
        sv.start();
        return sv;
      });

    ({ user, headers } = await cleanAndCreateUserAndHeader());

    await PurchasesModel.deleteMany({}, genericErrorHandler);
    await StockModel.deleteMany({}, genericErrorHandler);
    await ProductModel.deleteMany({}, genericErrorHandler);

    ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });
    await ox.save();

    shampoo = new ProductModel({ name: 'shampoo', measure_unit: 'ml' });
    await shampoo.save();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('GET Route', () => {
    it('receives an empty array when no purchases', async () => {
      const answer = await fetch(PURCHASES_URL, { headers })
        .then(res => res.json());

      expect(answer).toEqual({
        statusCode: 200,
        body: [],
      });
    });

    it('receives a list of purchases', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, total_price: 90 },
          { id: ox._id, qty: 1000, total_price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const purchasesController = new PurchasesController(user._id);
      await purchasesController.create(postBody);

      // Act
      const answer = await fetch(PURCHASES_URL, { headers })
        .then(res => res.json());

      // Assert
      expect(answer.body[0].stockEntries[0].product.name).toEqual(ox.name);
    });
  });

  describe('POST Route', () => {
    it('Can post a purchase', async () => {
      const beforeList = await PurchasesModel.find((err, purchases) => purchases);
      expect(beforeList.length).toBe(0);

      const postBody = {
        products: [
          { id: ox._id, qty: 500, total_price: 90 },
          { id: ox._id, qty: 1000, total_price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const res = await fetch(PURCHASES_URL, {
        method: 'POST',
        body: JSON.stringify(postBody),
        headers,
      }).then(resp => resp.json());

      expect(res.statusCode).toEqual(200);
      expect(res.body.seller).toEqual('Company one');
      expect(res.body.price).toEqual(130);
      expect(typeof res.body.stockEntries[0].id).toEqual('string');
      expect(res.body.stockEntries[0].product.name).toEqual(ox.name);
    });

    it('responds with errors in case there is', async () => {
      const postBody = {
        products: [
          { id: undefined, qty: undefined, total_price: 0 },
          { id: ox._id, qty: 1000, total_price: undefined },
        ],
        seller: undefined,
        date: '',
      };

      const expectedErrors = {
        seller: BLANK,
        date: BLANK,
        products: [
          {
            id: BLANK,
            qty: NOT_POSITIVE,
            total_price: NOT_POSITIVE,
          },
          {
            id: undefined,
            qty: undefined,
            total_price: NOT_POSITIVE,
          },
        ],
      };

      const res = await fetch(PURCHASES_URL, {
        method: 'POST',
        body: JSON.stringify(postBody),
        headers,
      }).then(resp => resp.json());

      expect(res.statusCode).toEqual(422);
      expect(res.errors).toEqual(expectedErrors);
    });
  });

  afterAll(async () => {
    await PurchasesModel.deleteMany({}, genericErrorHandler);
    await ProductModel.deleteMany({}, genericErrorHandler);
  });
});
