import 'isomorphic-fetch'; /* global fetch */
import Joi from 'joi';
import PurchasesModel from '../../purchases/model';
import SalesModel from '../../sales/model';
import StockModel from '../../stock/model';
import Product from '../../products/model';
import PurchasesController from '../../purchases/controller';
import SalesController from '../../sales/controller';
import Client from '../../clients/model';
import ProfessionalModel from '../../professionals/model';
import configureServer from '../../configureServer';
import { BLANK, NOT_POSITIVE } from '../../errors';
import getJoiValidationErrors from '../../joiAssertRequirePresence';
import cleanAndCreateUserAndHeader from '../../testHelpers/cleanUsersCreateUserAndHeader';

const SALES_URL = 'http://localhost:5001/sales';

const genericErrorHandler = (err) => {
  if (err) {
    throw new Error(err);
  }
};

const cleanUpDB = () =>
  PurchasesModel.deleteMany({}, genericErrorHandler)
    .then(() => Product.deleteMany({}, genericErrorHandler))
    .then(() => Client.deleteMany({}, genericErrorHandler))
    .then(() => ProfessionalModel.deleteMany({}, genericErrorHandler))
    .then(() => StockModel.deleteMany({}, genericErrorHandler))
    .then(() => SalesModel.deleteMany({}, genericErrorHandler));


describe('Sales routes', () => {
  let server;
  let ox;
  let shampoo;
  let cape;
  let client1;
  let professional1;
  let user;
  let headers;

  beforeEach(async () => { // booting server
    server = await configureServer()
      .then(async (sv) => {
        await sv.start();
        return sv;
      });

    await cleanUpDB();

    ({ user, headers } = await cleanAndCreateUserAndHeader());

    client1 = await new Client({ name: 'Mary', phone: '999' }).save();
    professional1 = await new ProfessionalModel({ name: 'Carl' }).save();

    ox = await new Product({ name: 'OX', measure_unit: 'ml', tenantId: user._id }).save();
    shampoo = await new Product({ name: 'shampoo', measure_unit: 'ml', tenantId: user._id }).save();
    cape = await new Product({ name: 'cape', measure_unit: 'unit', tenantId: user._id }).save();

    const purchaseBody = {
      products: [
        { id: ox._id, qty: 500, total_price: 90 },
        { id: shampoo._id, qty: 1000, total_price: 40 },
        { id: cape._id, qty: 1000, total_price: 10 },
      ],
      seller: 'Company one',
      date: Date.now(),
    };

    const purchaseController = new PurchasesController(user._id);
    await purchaseController.create(purchaseBody);
  });

  afterEach(async () => { // stoping server
    await cleanUpDB();
    await server.stop();
  });

  describe('GET route', () => {
    it('returns an empty list when there are no records', async () => {
      const answer = await fetch(SALES_URL, { headers })
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
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
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
      const salesController = new SalesController(user._id);
      await salesController.create(postBody);

      // Asserting
      const getBody = await fetch(SALES_URL, { headers }).then(res => res.json());

      expect(getBody.body.length).toBe(1);

      const firstSale = getBody.body[0];

      const joiGetBody = Joi.object().keys({
        _id: Joi.string(),
        id: Joi.string(),
        tenantId: Joi.any(),
        name: 'service one',
        client: {
          ...client1.toObject(),
          _id: Joi.string(),
        },
        professional: {
          ...professional1.toObject(),
          _id: Joi.string(),
        },
        start_time: Joi.date(),
        end_time: Joi.date(),
        time_spent: Joi.string(),
        profit_per_hour: Joi.number(),
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
        tenantId: Joi.any(),
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
      const postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
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
        headers,
      }).then(res => res.json());


      expect(response.code).toBe(200);

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
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
        time_spent: '6:00',
        profit_per_hour: 39.17,
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
        tenantId: Joi.any(),
      });

      expect(getJoiValidationErrors(joiGetBody, response.body)).toBe(null);

      const stockEntryOneSchema = Joi.object().keys({
        tenantId: Joi.any(),
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

    it('records a sale without products', async () => {
      const postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
        payment_method: 'money',
        value: 300,
      };

      const response = await fetch(SALES_URL, {
        method: 'POST',
        body: JSON.stringify(postBody),
        headers,
      }).then(res => res.json());

      expect(response.code).toBe(200);

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
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
        time_spent: '6:00',
        profit_per_hour: 50,
        payment: {
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          method: 'money',
          avaiable_at: Joi.any(),
        },
        stockEntries: Joi.array().length(0),
        profit: 300, // value_liquid - products
        __v: Joi.number(),
        tenantId: Joi.any(),
      });
      expect(getJoiValidationErrors(joiGetBody, response.body)).toBe(null);
    });

    it('returns an error case it is needed', async () => {
      const postBody = {
        name: '',
        client: '',
        professional: '',
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
        headers,
      }).then(res => res.json());

      expect(response.errors).toEqual(expectedErrors);

      expect(response.code).toBe(422);
    });
  });

  describe('PUT and DELETE routes', () => {
    let saleId;
    let postBody;

    beforeEach(async () => {
      postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: new Date(2017, 11, 7, 10, 0),
        end_time: new Date(2017, 11, 7, 16, 0),
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
        headers,
      }).then(res => res.json());

      saleId = response.body.id;
    });

    it('can update a sale', async () => {
      // Prepare
      const putBody = {
        id: saleId,
        ...postBody,
        name: 'service two',
        products: [{ qty: 1, product: cape._id }],
      };

      // Act
      const response = await fetch(SALES_URL, {
        method: 'PUT',
        body: JSON.stringify(putBody),
        headers,
      }).then(res => res.json());

      // Assert
      expect(response.body.stockEntries.length).toBe(1);
      expect(response.body.stockEntries[0].product.name).toBe(cape.name);
      expect(response.body.name).toEqual('service two');
    });

    it('can delete a sale', async () => {
      // Act
      const response = await fetch(SALES_URL, {
        method: 'DELETE',
        body: JSON.stringify(saleId),
        headers,
      }).then(res => res.json());

      // Assert
      expect(response.code).toBe(204);

      const salesController = new SalesController();
      const sale = await salesController.getOne(saleId);
      expect(sale).toEqual(null);
    });
  });
});
