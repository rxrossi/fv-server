import 'isomorphic-fetch'; /* global fetch */
import jwt from 'jwt-simple';
import { jwtSecret } from '../../auth';
import Product from '../../products/model';
import Client from '../../clients/model';
import User from '../../models/User';
import Professional from '../../models/Professionals';
import SalesController from '../../controllers/Sales';
import Sale from '../../models/Sales';
import PurchasesController from '../../controllers/Purchases';
import Stock from '../../models/Stock';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';

const PRODUCTS_URL = 'http://localhost:5001/products';
let server;
let user;
const headers = {
  'Content-Type': 'application/json',
};
const errHandler = err => (err ? console.error(err) : false);

async function cleanUP(cb = (() => {})) {
  await Professional.deleteMany({}, errHandler);
  await Stock.deleteMany({}, errHandler);
  await Client.deleteMany({}, errHandler);
  await Product.deleteMany({}, errHandler);
  await Sale.deleteMany({}, errHandler);
  await User.deleteMany({}, errHandler);

  return cb();
}

describe('Products Route', () => {
  beforeEach(async (done) => {
    server = await configureServer()
      .then((sv) => {
        sv.start();
        return sv;
      });

    await cleanUP();

    user = new User({
      email: 'user@mail.com',
      password: 'validpass',
    });

    await user.save(errHandler);

    headers.authorization = jwt.encode({ id: user._id }, jwtSecret);

    done();
  });

  afterEach(async (done) => {
    server.stop().then(() => cleanUP(done));
  });

  describe('GET Route', () => {
    it('receives an empty array when no products', async () => {
      const answer = await fetch(PRODUCTS_URL, { headers })
        .then(res => res.json());

      expect(answer).toEqual({
        code: 200,
        body: [],
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

      await Product.byTenant(user._id).insertMany(productsList, errHandler);

      const answer = await fetch(PRODUCTS_URL, { headers })
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(3);
      expect(answer.body[0].name).toEqual(expected[2].name);
      expect(answer.body[0].measure_unit).toEqual(expected[2].measure_unit);
      expect(answer.body[0].quantity).toEqual(expected[2].quantity);
      expect(answer.body[0].price).toEqual(expected[2].price);
      expect(answer.body[0].avgPriceFiveLast).toEqual(expected[2].avgPriceFiveLast);
    });

    it('sends a a list of products with valid stock when entries exist', async () => {
      let ox = { name: 'OX', measure_unit: 'ml' };
      ox = await Product.byTenant(user._id).create(ox);

      let client1 = { name: 'Mary', phone: '999' };
      client1 = await Client.byTenant(user._id).create(client1);

      let professional1 = { name: 'Carl' };
      professional1 = await Professional.byTenant(user._id).create(professional1);

      const purchase = {
        products: [
          { id: ox._id, qty: 1000, total_price: 100 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const purchasesController = new PurchasesController(user._id);
      const { purchase: savedPurchase } = await purchasesController.create(purchase);

      const sale = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
        payment_method: 'money',
        value: 300,
        products: [
          {
            qty: 100,
            product: ox._id,
          },
        ],
      };
      const saleController = new SalesController(user._id);
      const { sale: savedSale } = await saleController.create(sale);

      const answer = await fetch(PRODUCTS_URL, { headers })
        .then(res => res.json());

      expect(answer.code).toEqual(200);
      expect(answer.body.length).toEqual(1);
      expect(answer.body[0].name).toEqual(ox.name);

      expect(answer.body[0].quantity).toEqual(900);
      expect(answer.body[0].price_per_unit).toEqual(0.1);
      expect(answer.body[0].avgPriceFiveLast).toEqual(0.1);

      expect(answer.body[0].stock[0].qty).toEqual(purchase.products[0].qty);
      expect(answer.body[0].stock[0].price_per_unit)
        .toEqual(purchase.products[0].total_price / purchase.products[0].qty);

      const expectedSourceOrDestinationOfPurchase = {
        seller: purchase.seller,
        purchase_id: savedPurchase.id,
      };

      expect(answer.body[0].stock[0].sourceOrDestination)
        .toEqual(expectedSourceOrDestinationOfPurchase);

      expect(answer.body[0].stock[1].qty).toEqual(sale.products[0].qty);
      expect(answer.body[0].stock[1].price_per_unit)
        .toEqual(0.1);
      expect(answer.body[0].stock[1].sourceOrDestination).toEqual({
        name: `${sale.name} (${client1.name})`,
        sale_id: savedSale.id,
      });
    });
  });

  describe('POST Route', () => {
    it('Can post a product', async () => {
      const beforeList = await Product.byTenant(user._id).find((err, products) => products);
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      const response = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
        headers,
      }).then(res => res.json());

      const afterList = await Product.byTenant(user._id).find((err, products) => products);
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(productExample.name);

      expect(response.code).toEqual(200);
      expect(response.body.name).toEqual(productExample.name);
    });

    it('Can\'t post a product with the same name of a previous product', async () => {
      const beforeList = await Product.find((err, products) => products);
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
        headers,
      }).then(res => res.json());

      const res2 = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
        headers,
      }).then(res => res.json());


      const afterList = await Product.find((err, products) => products);

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
  });
});
