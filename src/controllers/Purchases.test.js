import mongoose from 'mongoose';
import ProductsController from './Products';
import StockController from './Stock';
import PurchasesController from './Purchases';
import ProductModel from '../models/Products';
import StockModel from '../models/Stock';
import PurchasesModel from '../models/Purchases';

describe('Purchases Controller', () => {
  let sut;

  beforeEach((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
      .then(() => done())
  });

  beforeEach((done) => {
    // Delete all products
    ProductModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  afterEach((done) => {
    // Delete all products
    ProductModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  beforeEach((done) => {
    // Delete all stock
    StockModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  afterEach((done) => {
    // Delete all stock
    StockModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  beforeEach((done) => {
    // Delete all purchases
    PurchasesModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  afterEach((done) => {
    // Delete all purchases
    PurchasesModel.deleteMany({}, (err) => {
      if (err) {
        console.error('an error', err);
      }
      done();
    });
  });

  describe('With no entries yet', () => {
    let ox;
    let shampoo
    beforeEach((done) => {
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

    it('correctly posts a new purchase', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, price: 90 },
          { id: ox._id, qty: 1000, price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      }
      const sut = new PurchasesController;

      // Act
      await sut.create(postBody);

      // Assert
      const purchases = await PurchasesModel.find({}).populate('products');

      expect(purchases[0].products.length).toBe(2);
      expect(purchases[0].seller).toEqual("Company one");
      expect(purchases[0].price).toEqual(130);
      expect(purchases[0].products[0].qty).toEqual(500);
    });

    it.only('returns all purchases correctly with products and their name populated', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, price: 90 },
          { id: shampoo._id, qty: 1000, price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const sut = new PurchasesController;
      await sut.create(postBody);

      // Act
      const purchases = await sut.getAll();
      console.log(purchases)

      // Assert
      expect(purchases[0].products[0].product.name).toEqual(ox.name);
    });
  });
});