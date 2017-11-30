import 'isomorphic-fetch';
import PurchasesModel from '../../models/Purchases';
import ProductModel from '../../models/Products';
import PurchasesController from '../../controllers/Purchases';
import configureServer from '../../index';
import { NOT_UNIQUE } from '../../errors';

const PURCHASES_URL = 'http://localhost:5001/purchases';
let server;

describe('Purchases Route', () => {
  let ox;
  let shampoo;

  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

    await PurchasesModel.deleteMany({}, (err) => {
      if (err) {
        throw "Could not PurchasesModel.deleteMany on DB";
      }
      return true;
    })

    await ProductModel.deleteMany({}, (err) => {
      if (err) {
        throw "Could not ProductModel.deleteMany on DB";
      }
      return true;
    })

  });

  beforeEach((done) => {
    // inserting products
    ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });
    ox.save((err, product) => {
      if (err) {
        console.error(err);
      }
      done();
    });

    shampoo = new ProductModel({ name: 'shampoo', measure_unit: 'ml' });
    shampoo.save((err, product) => {
      if (err) {
        console.error(err);
      }
      done();
    });
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  describe('GET Route', () => {
    it('receives an empty array when no purchases', async () => {
      const answer = await fetch(PURCHASES_URL)
        .then(res => res.json())

      expect(answer).toEqual({
        code: 200,
        body: []
      });
    });

    it.only('receives a list of purchases', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, price: 90 },
          { id: ox._id, qty: 1000, price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      }

      const purchasesController = new PurchasesController;
      await purchasesController.create(postBody);

      // Act
      const answer = await fetch(PURCHASES_URL)
        .then(res => res.json());

      // Assert
      expect(answer.body[0].products[0].product.name).toEqual(ox.name);
    });
  })

  describe('POST Route', () => {
    it('Can post a purchase', async () => {
      const beforeList = await PurchasesModel.find((err, purchases) => {
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

      const afterList = await PurchasesModel.find((err, purchases) => {
        return purchases;
      });
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(purchaseExample.name);

      expect(res.code).toEqual(201); //201 means created
      expect(res.body.name).toEqual(purchaseExample.name);
    });
  })
});
