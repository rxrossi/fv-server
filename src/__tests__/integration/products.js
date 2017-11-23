import 'isomorphic-fetch';
import Product from '../../models/Products';
import configureServer from '../../index';
import { NOT_UNIQUE } from '../../errors';

const PRODUCTS_URL = 'http://localhost:5001/products';
let server;

describe('Products Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

    await Product.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Product.deleteMany on DB";
      }
      return true;
    })
  });

  afterEach((done) => {
    server.stop(done);
  });

  describe('GET Route', () => {
    it('receives an empty array when no products', async () => {
      const answer = await fetch(PRODUCTS_URL)
        .then(res => res.json())

      expect(answer).toEqual({
        code: 200,
        body: []
      });
    });

    it('receives a list of products', async () => {
      const productsList = [
        { id: '1', name: 'OX', measure_unit: 'ml' },
        { id: '2', name: 'Shampoo', measure_unit: 'ml' },
        { id: '3', name: 'Capes', measure_unit: 'unit' },
      ];

      await Product.collection.insert(productsList, (err) => {
        if (err) {
          console.log(err);
        }
      });

      const answer = await fetch(PRODUCTS_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(3);
      expect(answer.body[0].name).toEqual(productsList[0].name);
    });
  })

  describe('POST Route', () => {
    it('Can post a product', async () => {
      const beforeList = await Product.find((err, products) => {
        return products;
      });
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      const res = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
      }).then(res => res.json());

      const afterList = await Product.find((err, products) => {
        return products;
      });
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(productExample.name);

      expect(res.code).toEqual(201); //201 means created
      expect(res.body.name).toEqual(productExample.name);
    });

    it('Can\'t post a product with the same name of a previous product', async () => {
      const beforeList = await Product.find((err, products) => {
        return products;
      });
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      const res1 = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
      }).then(res => res.json())

      const res2 = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
      }).then(res => res.json());


      const afterList = await Product.find((err, products) => {
        return products;
      });

      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(productExample.name);

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
