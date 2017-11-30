import mongoose from 'mongoose';
import ProductsController from './Products';
import ProductModel from '../models/Products';
import StockModel from '../models/Stock';

describe('ProductsController', () => {
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
        price: 10,
      });

      entryOne.save((err, entry) => {
        if (err) {
          console.error('entry', err);
        }
      });
    });

    sut = new ProductsController;

    // Act
    const products = await sut.getAll();

    // Assert
    expect(products[0].price).toBe(10);
    expect(products[0].quantity).toBe(1);
    expect(products[0].avgPriceFiveLast).toBe(10);
  });

  it('creates a product', async () => {
    const ox = { name: 'OX', measure_unit: 'ml' };

    sut = new ProductsController;

    const { product, errors } = await sut.create(ox);

    expect(product.name).toEqual(ox.name);
  });

  it('cannot create a product with duplicated name', async () => {
    const ox = { name: 'OX', measure_unit: 'ml' };

    sut = new ProductsController;

    await sut.create(ox);
    const { product, errors } = await sut.create(ox);

    expect(errors.name).toEqual('NOT_UNIQUE');
  });
});
