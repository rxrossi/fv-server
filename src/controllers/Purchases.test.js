import mongoose from 'mongoose';
import PurchasesController from './Purchases';
import ProductModel from '../models/Products';
import StockModel from '../models/Stock';
import ProductsController from './Products';
import PurchasesModel from '../models/Purchases';

const productsController = new ProductsController();
const sut = new PurchasesController();

const errLogger = (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(err);
  }
};

const cleanUpDB = () =>
  ProductModel.deleteMany({}, errLogger)
    .then(() => StockModel.deleteMany({}, errLogger))
    .then(() => PurchasesModel.deleteMany({}), errLogger);

describe('Purchases Controller', () => {
  beforeEach((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
      .then(() => cleanUpDB())
      .then(() => done());
  });


  describe('With no entries yet', () => {
    let ox;
    let shampoo;
    beforeEach(async (done) => {
      ox = await productsController.create({ name: 'ox', measure_unit: 'ml' })
        .then(({ product }) => product);

      shampoo = await productsController.create({ name: 'shampoo', measure_unit: 'ml' })
        .then(({ product }) => product);

      done();
    });

    it('correctly posts a new purchase', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, total_price: 90 },
          { id: ox._id, qty: 1000, total_price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      // Act
      await sut.create(postBody);

      // Assert
      const purchases = await PurchasesModel.find({}).populate('stockEntries');

      expect(purchases[0].stockEntries.length).toBe(2);
      expect(purchases[0].seller).toEqual('Company one');
      expect(purchases[0].stockEntries[0].qty).toEqual(500);
    });

    it('returns all purchases correctly with products and their name populated', async () => {
      // Prepare
      const postBody = {
        products: [
          { id: ox._id, qty: 500, total_price: 90 },
          { id: shampoo._id, qty: 1000, total_price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      await sut.create(postBody);

      // Act
      const purchases = await sut.getAll();

      // Assert
      expect(purchases[0].stockEntries[0].product.name).toEqual(ox.name);
    });
  });

  describe('With a default entry', () => {
    let ox;
    let shampoo;
    let cape;
    let purchaseExample;
    beforeEach(async (done) => {
      // create shampoo and ox products
      ox = await productsController.create({ name: 'ox', measure_unit: 'ml' })
        .then(({ product }) => product);

      shampoo = await productsController.create({ name: 'shampoo', measure_unit: 'ml' })
        .then(({ product }) => product);

      cape = await productsController.create({ name: 'cape', measure_unit: 'unit' })
        .then(({ product }) => product);

      // create a purchase example
      const postBody = {
        products: [
          { id: ox._id, qty: 500, total_price: 90 },
          { id: shampoo._id, qty: 1000, total_price: 40 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };
      purchaseExample = await sut.create(postBody);
      done();
    });

    it('correctly update a sale', async () => {
      // Prepare
      const putBody = {
        ...purchaseExample,
        seller: 'Company two',
        products: [
          { id: shampoo._id, qty: 1000, total_price: 40 },
          { id: cape._id, qty: 1, total_price: 1 },
        ],
      };
      // Act
      const updatedPurchase = await sut.update(putBody);

      // Assert
      expect(updatedPurchase).toMatchObject(putBody);
    });
  });
});
