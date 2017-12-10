import 'isomorphic-fetch'; /* global fetch */
import Joi from 'joi';
import PurchasesModel from '../../models/Purchases';
import SalesModel from '../../models/Sales';
import StockModel from '../../models/Stock';
import ProductModel from '../../models/Products';
import PurchasesController from '../../controllers/Purchases';
import SalesController from '../../controllers/Sales';
import ClientModel from '../../models/Clients';
import ProfessionalModel from '../../models/Professionals';
import configureServer from '../../configureServer';
import { BLANK, NOT_POSITIVE } from '../../errors';

const SALES_URL = 'http://localhost:5001/sales';

const genericErrorHandler = (err) => {
  if (err) {
    throw new Error(err);
  }
};

describe('Sales routes', () => {
  let server = 'pre';
  let ox;
  let shampoo;
  let client1;
  let professional1;
  let purchase1;

  beforeEach(async () => { // booting server
    server = await configureServer()
      .then(async (sv) => {
        await sv.start();
        return sv;
      });

    await PurchasesModel.deleteMany({}, genericErrorHandler);
    await ProductModel.deleteMany({}, genericErrorHandler);
    await ClientModel.deleteMany({}, genericErrorHandler);
    await ProfessionalModel.deleteMany({}, genericErrorHandler);
    await StockModel.deleteMany({}, genericErrorHandler);
    await SalesModel.deleteMany({}, genericErrorHandler);

    client1 = new ClientModel({ name: 'Mary', phone: '999' });
    client1.save();

    professional1 = new ProfessionalModel({ name: 'Carl' });
    professional1.save();

    ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });
    ox.save();

    shampoo = new ProductModel({ name: 'shampoo', measure_unit: 'ml' });
    shampoo.save();

    // Register purchase of OX and Shampoo, the price will be used bellow
    const purchaseBody = {
      products: [
        { id: ox._id, qty: 500, total_price: 90 },
        { id: shampoo._id, qty: 1000, total_price: 40 },
      ],
      seller: 'Company one',
      date: Date.now(),
    };

    const purchaseController = new PurchasesController();
    purchase1 = await purchaseController.create(purchaseBody);
  });

  afterEach(async () => { // stoping server
    await SalesModel.deleteMany({}, genericErrorHandler);
    await ProductModel.deleteMany({}, genericErrorHandler);
    await ProfessionalModel.deleteMany({}, genericErrorHandler);
    await ClientModel.deleteMany({}, genericErrorHandler);
    await StockModel.deleteMany({}, genericErrorHandler);

    await server.stop();
  });

  describe('GET route', () => {
    it('returns an empty list when there are no records', async () => {
      const answer = await fetch(SALES_URL)
        .then(res => res.json());

      expect(answer).toEqual({
        code: 200,
        body: [],
      });
    });

    it('return a list of sales when there are', async () => {
      // Writting on db
      const postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        date: '2017-12-07',
        start_time: '12:00',
        end_time: '16:00',
        payment_method: 'money',
        value: 300,
        products: [
          {
            qty: 250,
            product: ox._id,
          },
          {
            qty: 500,
            product: shampoo._id,
          },
        ],
      };
      const salesController = new SalesController();
      await salesController.create(postBody);
      // Asserting
      const getBody = await fetch(SALES_URL).then(res => res.json());

      expect(getBody.body.length).toBe(1);

      const firstSale = getBody.body[0];

      const joiGetBody = Joi.object().keys({
        _id: Joi.string(),
        id: Joi.string(),
        name: 'service one',
        client: {
          ...client1.toObject(),
          _id: Joi.string(),
        },
        professional: {
          ...professional1.toObject(),
          _id: Joi.string(),
        },
        start_time: Joi.string(),
        end_time: Joi.string(),
        date: Joi.date(),
        payment: {
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          method: 'money',
          avaiable_at: Joi.date(),
        },
        stockEntries: Joi.array().length(2),
        profit: 300 - 45 - 20, // value_liquid - products
        __v: Joi.number(),
      });

      Joi.assert(firstSale, joiGetBody);

      const stockEntryOneSchema = Joi.object().keys({
        _id: Joi.string(),
        id: Joi.string(),
        __v: Joi.number(),
        date: Joi.string(),
        sale: Joi.string(),
        qty: Joi.number(),
        price_per_unit: Joi.number(),
        product: Joi.object(),
      });
      Joi.assert(firstSale.stockEntries[0], stockEntryOneSchema);
    });
  });

  describe('POST route', () => {
    it('records a POST request on database', async () => {
      // await StockModel.deleteMany({}, genericErrorHandler);
      // await PurchasesModel.deleteMany({}, genericErrorHandler);

      const postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        date: '2017-12-07',
        start_time: '12:00',
        end_time: '16:00',
        payment_method: 'money',
        value: 300,
        products: [
          {
            qty: 250,
            product: ox._id,
          },
          {
            qty: 500,
            product: shampoo._id,
          },
        ],
      };

      const response = await fetch(SALES_URL, {
        method: 'POST',
        body: JSON.stringify(postBody),
      }).then(res => res.json());

      expect(response.code).toBe(201);

      const joiGetBody = Joi.object().keys({
        _id: Joi.string(),
        id: Joi.string(),
        name: 'service one',
        client: {
          ...client1.toObject(),
          _id: Joi.string(),
        },
        professional: {
          ...professional1.toObject(),
          _id: Joi.string(),
        },
        start_time: '12:00',
        end_time: '16:00',
        date: new Date('2017-12-07'),
        payment: {
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          method: 'money',
          avaiable_at: Joi.any(),
        },
        stockEntries: Joi.array().length(2),
        profit: 300 - 45 - 20, // value_liquid - products
        __v: Joi.number(),
      });
      Joi.assert(response.body, joiGetBody);

      const stockEntryOneSchema = Joi.object().keys({
        _id: Joi.string(),
        id: Joi.string(),
        __v: Joi.number(),
        date: Joi.string(),
        sale: Joi.string(),
        qty: Joi.number(),
        price_per_unit: Joi.number(),
        product: Joi.object(),
      });

      Joi.assert(response.body.stockEntries[0], stockEntryOneSchema);
    });

    it('returns an error case it is needed', async () => {
      const postBody = {
        name: '',
        client: '',
        professional: '',
        date: '',
        start_time: '',
        end_time: '',
        payment_method: '',
        value: '',
        products: [
          {
            qty: 250,
            product: '',
          },
          {
            qty: undefined,
            product: shampoo._id,
          },
        ],
      };

      const expectedErrors = {
        name: BLANK,
        client: BLANK,
        professional: BLANK,
        date: BLANK,
        start_time: BLANK,
        end_time: BLANK,
        payment_method: BLANK,
        value: NOT_POSITIVE,
        products: [
          {
            product: BLANK,
          },
          {
            qty: NOT_POSITIVE,
          },
        ],
      };

      const response = await fetch(SALES_URL, {
        method: 'POST',
        body: JSON.stringify(postBody),
      }).then(res => res.json());

      expect(response.errors).toEqual(expectedErrors);

      expect(response.code).toBe(422);
    });
  });
});
