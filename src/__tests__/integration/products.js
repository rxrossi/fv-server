import 'isomorphic-fetch';
import Product from '../../models/Products';
import Stock from '../../controllers/Stock';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';

const stock = new Stock;

const PRODUCTS_URL = 'http://localhost:5001/products';
let server;

describe('Products Route', () => {
  beforeEach(async () => {
    server = await configureServer()
      .then((server) => {
        server.start();
        return server;
      });

  });

  beforeEach((done) => {
    Product.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Product.deleteMany on DB";
      }
      done();
    })
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  afterAll((done) => {
    Product.deleteMany({}, (err) => {
      if (err) {
        throw "Could not Product.deleteMany on DB";
      }
      done();
    })
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

    it('receives a list of products where stock is a empty list, entries on it does not exist yet ', async () => {
      const productsList = [
        { name: 'OX', measure_unit: 'ml' },
        { name: 'Shampoo', measure_unit: 'ml' },
        { name: 'Capes', measure_unit: 'unit' },
      ];

      const expected = [
        {
          ...productsList[0],
          quantity: 0,
          price: '',
          avgPriceFiveLast: '',
          stock: [],
        },
        {
          ...productsList[1],
          quantity: 0,
          price: '',
          avgPriceFiveLast: '',
          stock: [],
        },
        {
          ...productsList[2],
          quantity: 0,
          price: '',
          avgPriceFiveLast: '',
          stock: [],
        },
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
      expect(answer.body[0].name).toEqual(expected[0].name);
      expect(answer.body[0].measure_unit).toEqual(expected[0].measure_unit);
      expect(answer.body[0].quantity).toEqual(expected[0].quantity);
      expect(answer.body[0].price).toEqual(expected[0].price);
      expect(answer.body[0].avgPriceFiveLast).toEqual(expected[0].avgPriceFiveLast);
    });

    it('sends a a list of products with valid stock when entries exist', async () => {

      const product = { name: 'OX', measure_unit: 'ml' };

      await Product.collection.insert([product], (err) => {
        if (err) {
          console.log(err);
        }
      });

      const ox = await Product.findOne({ name: 'OX' })

      const entries = [
        {
          product: ox.id,
          qty: -3,
          price: 1,
          date: '10 25 2017',
        },
        {
          product: ox.id,
          qty: 10,
          price: 2,
          date: '10 24 2017',
        },
      ];

      await stock.create(entries[0]);
      await stock.create(entries[1]);

      const answer = await fetch(PRODUCTS_URL)
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(1);
      expect(answer.body[0].name).toEqual(product.name);

      expect(answer.body[0].quantity).toEqual(7);
      expect(answer.body[0].price).toEqual(2);
      expect(answer.body[0].avgPriceFiveLast).toEqual(2);

      expect(answer.body[0].stock[0].qty).toEqual(entries[0].qty);
      expect(answer.body[0].stock[0].price).toEqual(entries[0].price);
      expect(answer.body[0].stock[0].sourceOrDestination).toEqual(entries[0].sourceOrDestination);

      expect(answer.body[0].stock[1].qty).toEqual(entries[1].qty);
      expect(answer.body[0].stock[1].price).toEqual(entries[1].price);
      expect(answer.body[0].stock[1].sourceOrDestination).toEqual(entries[1].sourceOrDestination);
    });
  });

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
