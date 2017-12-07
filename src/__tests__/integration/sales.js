import 'isomorphic-fetch'; /* global fetch */
import Joi from 'joi';
import PurchasesModel from '../../models/Purchases';
import SaleModel from '../../models/Sales';
import StockModel from '../../models/Stock';
import ProductModel from '../../models/Products';
import PurchasesController from '../../controllers/Purchases';
import ClientModel from '../../models/Clients';
import ProfessionalModel from '../../models/Professionals';
import configureServer from '../../configureServer';

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

    PurchasesModel.deleteMany({}, genericErrorHandler);
    ProductModel.deleteMany({}, genericErrorHandler);
    ClientModel.deleteMany({}, genericErrorHandler);
    ProfessionalModel.deleteMany({}, genericErrorHandler);
    StockModel.deleteMany({}, genericErrorHandler);

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
        { id: ox._id, qty: 500, price: 90 },
        { id: shampoo._id, qty: 1000, price: 40 },
      ],
      seller: 'Company one',
      date: Date.now(),
    };

    const purchaseController = new PurchasesController();
    purchase1 = await purchaseController.create(purchaseBody);
  });

  afterEach(async () => { // stoping server
    SaleModel.deleteMany({}, genericErrorHandler);
    ProductModel.deleteMany({}, genericErrorHandler);
    ProfessionalModel.deleteMany({}, genericErrorHandler);
    ClientModel.deleteMany({}, genericErrorHandler);
    StockModel.deleteMany({}, genericErrorHandler);

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
      // example of POST body
      const sale1Post = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: '10 10 2017 12:00',
        end_time: '10 10 2017 16:00',
        payment: {
          value_total: 300,
          method: 'money',
        },
        products: [
          {
            qty: 250,
            product: ox._id,
            price: purchase1.stockEntries[0].price / 2, // because it is using half
          },
          {
            qty: 500,
            product: shampoo._id,
            price: purchase1.stockEntries[1].price / 2, // because it is using half
          },
        ],
      };

      // Saving a sale directly
      const sale1 = new SaleModel({
        name: sale1Post.name,
        client: sale1Post.client,
        professional: sale1Post.professional,
        start_time: sale1Post.start_time,
        end_time: sale1Post.end_time,
        payment: {
          method: 'money',
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          avaiable_at: '10 10 2017',
        },
      });
      await sale1.save();

      // Saving the stock entry for product 1
      const entry1 = new StockModel({
        product: sale1Post.products[0].product,
        sale: sale1.id,
        qty: sale1Post.products[0].qty,
        price: sale1Post.products[0].price,
        date: Date.now(),
      });
      await entry1.save();

      // Saving the stock entry for product 2
      const entry2 = new StockModel({
        product: sale1Post.products[1].product,
        sale: sale1.id,
        qty: sale1Post.products[1].qty,
        price: sale1Post.products[1].price,
        date: Date.now(),
      });
      await entry2.save();

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
        start_time: new Date('10 10 2017 12:00'),
        end_time: new Date('10 10 2017 16:00'),
        payment: {
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          method: 'money',
          avaiable_at: new Date('10 10 2017'),
        },
        stockEntries: Joi.array().length(2).items([
          {
            _id: Joi.string(),
            id: Joi.string(),
            __v: Joi.number(),
            date: Joi.string(),
            sale: Joi.string(),
            qty: 250,
            price: 45,
            product: {
              ...ox.toObject(),
              _id: Joi.string(),
            },
          },
          {
            _id: Joi.string(),
            id: Joi.string(),
            __v: Joi.number(),
            date: Joi.string(),
            sale: Joi.string(),
            qty: 500,
            price: 20,
            product: {
              ...shampoo.toObject(),
              _id: Joi.string(),
            },
          },
        ]),
        profit: 300 - 45 - 20, // value_liquid - products
        __v: Joi.number(),
      });

      Joi.assert(firstSale, joiGetBody);
    });
  });

  describe('POST route', () => {
    it.only('records a POST request on database', async () => {
      const postBody = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        date: '2017-12-07',
        start_time: '12:00',
        end_time: '16:00',
        payment_method: 'Money',
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

      console.log(response);
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
        start_time: new Date('10 10 2017 12:00'),
        end_time: new Date('10 10 2017 16:00'),
        payment: {
          value_total: 300,
          value_liquid: 300,
          discount: 'none',
          method: 'money',
          avaiable_at: Joi.any(),
        },
        stockEntries: Joi.array().length(2).items([
          {
            _id: Joi.string(),
            id: Joi.string(),
            __v: Joi.number(),
            date: Joi.string(),
            sale: Joi.string(),
            qty: 250,
            price: 45,
            product: {
              ...ox.toObject(),
              _id: Joi.string(),
            },
          },
          {
            _id: Joi.string(),
            id: Joi.string(),
            __v: Joi.number(),
            date: Joi.string(),
            sale: Joi.string(),
            qty: 500,
            price: 20,
            product: {
              ...shampoo.toObject(),
              _id: Joi.string(),
            },
          },
        ]),
        profit: 300 - 45 - 20, // value_liquid - products
        __v: Joi.number(),
      });

      Joi.assert(response.body, joiGetBody);
    });
  });
});
