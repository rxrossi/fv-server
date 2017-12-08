import mongoose from 'mongoose';
import ProductsController from './Products';
import StockController from './Stock';
import ProductModel from '../models/Products';
import StockModel from '../models/Stock';

describe.skip('ProductsController', () => {
  let sut;

  beforeEach((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
      .then(() => done());
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

  describe('With entries', () => {
    let ox;
    beforeEach((done) => {
      ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });

      ox.save((err, product) => {
        if (err) {
          console.error(err);
        }

        const entryOne = new StockModel({
          product: product._id,
          date: '10 27 2017',
          qty: 1,
          price: 10,
        });

        entryOne.save((err, entry) => {
          if (err) {
            console.error('entry', err);
          }
          done();
        });
      });
    });

    it('return a stock entry', async () => {
      // Prepare
      const sut = new StockController();

      // Act
      const answer = await sut.getAll();

      // Assert
      expect(answer[0].qty).toBe(1);
      expect(answer[0].price).toBe(10);
      expect(answer[0].product.name).toBe(ox.name);
      expect(answer[0].product.measure_unit).toBe(ox.measure_unit);
    });
  });

  describe('Without entries, adding a new one', () => {
    let ox;
    beforeEach((done) => {
      ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });

      ox.save((err, product) => {
        if (err) {
          console.error(err);
        }
        done();
      });
    });

    it('adds a stock entry', async () => {
      const { id: productId } = await ProductModel.findOne({ name: ox.name });

      const postBody = {
        product: productId,
        qty: 4,
        price: 12,
      };

      const sut = new StockController();

      await sut.create(postBody);

      // Act
      const stock = await sut.getAll();

      // Assert
      expect(stock[0].product.name).toEqual(ox.name);
      expect(stock[0].price).toEqual(postBody.price);
      expect(stock[0].qty).toEqual(postBody.qty);
    });
  });
});
