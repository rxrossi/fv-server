import mongoose from 'mongoose';
import ProductsController from './Products';
import ProductModel from '../models/Products';
import StockModel from '../models/Stock';

const errLogger = (err) => {
  if (err) {
    console.error(err);
  }
};

describe('ProductsController', () => {
  let sut;
  beforeEach((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
      .then(() => done());
  });

  beforeEach((done) => {
    ProductModel.deleteMany({}, errLogger).then(() =>
      StockModel.deleteMany({}, errLogger)).then(() => done());
  });

  afterEach((done) => {
    ProductModel.deleteMany({}, errLogger).then(() =>
      StockModel.deleteMany({}, errLogger)).then(() => done());
  });

  describe('GET', () => {
    it('returns getAll when there are products', async () => {
      // Prepare
      const ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });

      await ox.save((err, product) => {
        if (err) {
          console.error(err);
        }
        const entryOne = new StockModel({
          product: product._id,
          date: '10 27 2017',
          qty: 1,
          price_per_unit: 10,
        });

        entryOne.save((error) => {
          if (error) {
            console.error('entry', error);
          }
        });
      });

      sut = new ProductsController();

      // Act
      const products = await sut.getAll();

      // Assert
      expect(products[0].price_per_unit).toBe(10);
      expect(products[0].quantity).toBe(1);
      expect(products[0].avgPriceFiveLast).toBe(10);
    });
  });

  describe('CREATE', () => {
    it('creates a product', async () => {
      const ox = { name: 'OX', measure_unit: 'ml' };

      sut = new ProductsController();

      const { product } = await sut.create(ox);

      expect(product.name).toEqual(ox.name);
    });

    it('cannot create a product with duplicated name', async () => {
      const ox = { name: 'OX', measure_unit: 'ml' };

      sut = new ProductsController();

      await sut.create(ox);

      const { errors } = await sut.create(ox);

      expect(errors.name).toEqual('NOT_UNIQUE');
    });
  });

  describe('Update', () => {
    it('can update a product', async () => {
      // Prepare
      const ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });

      await ox.save((err, product) => {
        if (err) {
          console.error(err);
        }
        const entryOne = new StockModel({
          product: product._id,
          date: '10 27 2017',
          qty: 1,
          price_per_unit: 10,
        });

        entryOne.save((error) => {
          if (error) {
            console.error('entry', error);
          }
        });
      });

      const updatedOx = {
        _id: ox._id,
        name: 'updatedOX',
        measure_unit: 'ml',
      };

      sut = new ProductsController();

      // Act
      const product = await sut.update(updatedOx);

      // Assert
      expect(product.name).toEqual('updatedOX');
    });
  });
});
