import 'isomorphic-fetch'; /* global fetch */
import Product from '../../models/Products';
import ClientModel from '../../models/Clients';
import ProfessionalModel from '../../models/Professionals';
import SalesController from '../../controllers/Sales';
import SalesModel from '../../models/Sales';
import PurchasesController from '../../controllers/Purchases';
import Stock from '../../controllers/Stock';
import StockModel from '../../models/Stock';
import configureServer from '../../configureServer';
import { NOT_UNIQUE } from '../../errors';

const stock = new Stock();

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

  beforeEach(async () => {
    await ProfessionalModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not ProfessionalModel.deleteMany on DB';
      }
    });

    await StockModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not StockModel.deleteMany on DB';
      }
    });

    await ClientModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not ProfessionalModel.deleteMany on DB';
      }
    });

    await Product.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not Product.deleteMany on DB';
      }
    });
  });

  afterEach((done) => {
    server.stop().then(() => done());
  });

  beforeEach(async () => {
    await ProfessionalModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not ProfessionalModel.deleteMany on DB';
      }
    });

    await StockModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not StockModel.deleteMany on DB';
      }
    });

    await SalesModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not SalesModel.deleteMany on DB';
      }
    });

    await ClientModel.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not ProfessionalModel.deleteMany on DB';
      }
    });

    await Product.deleteMany({}, (err) => {
      if (err) {
        throw 'Could not Product.deleteMany on DB';
      }
    });
  });

  describe('GET Route', () => {
    it('receives an empty array when no products', async () => {
      const answer = await fetch(PRODUCTS_URL)
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

      await Product.collection.insert(productsList, (err) => {
        if (err) {
          console.log(err);
        }
      });

      const answer = await fetch(PRODUCTS_URL)
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
      const ox = new Product({ name: 'OX', measure_unit: 'ml' });
      ox.save();

      const client1 = new ClientModel({ name: 'Mary', phone: '999' });
      client1.save();

      const professional1 = new ProfessionalModel({ name: 'Carl' });
      professional1.save();

      const purchase = {
        products: [
          { id: ox._id, qty: 1000, total_price: 100 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const purchasesController = new PurchasesController();
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
      const saleController = new SalesController();
      const { sale: savedSale } = await saleController.create(sale);
      const stockController = new Stock();
      const stockEntries = await stockController.getAll();

      const answer = await fetch(PRODUCTS_URL)
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
      const beforeList = await Product.find((err, products) => products);
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      const res = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
      }).then(res => res.json());

      const afterList = await Product.find((err, products) => products);
      expect(afterList.length).toBe(1);
      expect(afterList[0].name).toEqual(productExample.name);

      expect(res.code).toEqual(201); // 201 means created
      expect(res.body.name).toEqual(productExample.name);
    });

    it('Can\'t post a product with the same name of a previous product', async () => {
      const beforeList = await Product.find((err, products) => products);
      expect(beforeList.length).toBe(0);

      const productExample = {
        name: 'OX',
        measure_unit: 'unit',
      };

      const res1 = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
      }).then(res => res.json());

      const res2 = await fetch(PRODUCTS_URL, {
        method: 'POST',
        body: JSON.stringify(productExample),
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
