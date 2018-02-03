import mongoose from 'mongoose';
import SalesController from '../sales/controller';
import StockController from './controller';
import PurchasesController from '../purchases/controller';
import ProductModel from '../products/model';
import StockModel from '../stock/model';
import ClientModel from '../clients/model';
import ProfessionalModel from '../professionals/model';

const errHandler = cb => (err) => {
  if (err) {
    console.error('an error', err);
  }
  cb();
};

describe('StockController', () => {
  let sut;

  beforeEach((done) => {
    mongoose.Promise = global.Promise;
    mongoose.connect('mongodb://localhost/fv', { useMongoClient: true })
      .then(() => done());
  });

  // Delete all Professionals
  beforeEach(done =>
    ProfessionalModel.deleteMany({}, errHandler(done)));
  afterEach(done =>
    ProfessionalModel.deleteMany({}, errHandler(done)));

  // Delete all Clients
  beforeEach(done =>
    ClientModel.deleteMany({}, errHandler(done)));
  afterEach(done =>
    ClientModel.deleteMany({}, errHandler(done)));

  // Delete all products
  beforeEach(done =>
    ProductModel.deleteMany({}, errHandler(done)));
  afterEach(done =>
    ProductModel.deleteMany({}, errHandler(done)));

  // Delete all stock
  beforeEach(done =>
    StockModel.deleteMany({}, errHandler(done)));
  afterEach(done =>
    StockModel.deleteMany({}, errHandler(done)));

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
          price_per_unit: 10,
        });

        entryOne.save((errEntry) => {
          if (errEntry) {
            console.error('entry', err);
          }
          done();
        });
      });
    });

    it('return a stock entry', async () => {
      // Prepare
      sut = new StockController();

      // Act
      const answer = await sut.getAll();

      // Assert
      expect(answer[0].qty).toBe(1);
      expect(answer[0].price_per_unit).toBe(10);
      expect(answer[0].product.name).toBe(ox.name);
      expect(answer[0].product.measure_unit).toBe(ox.measure_unit);
    });
  });

  describe('Without entries, adding a new one', () => {
    let ox;
    beforeEach((done) => {
      ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });

      ox.save(err => errHandler(done)(err));
    });

    it('adds a stock entry', async () => {
      const { id: productId } = await ProductModel.findOne({ name: ox.name });

      const postBody = {
        product: productId,
        qty: 4,
        total_price: 12,
        date: '10 10 2017',
      };

      sut = new StockController();

      await sut.create(postBody);

      // Act
      const stock = await sut.getAll();

      // Assert
      expect(stock[0].product.name).toEqual(ox.name);
      expect(stock[0].price).toEqual(postBody.price);
      expect(stock[0].qty).toEqual(postBody.qty);
    });
  });

  describe('Integration with Products and Sales Controller', () => {
    let client1;
    let ox;
    let professional1;
    let purchase;
    let sale;
    let saleResponseFromController;
    let purchaseResponseFromController;
    const sut = new StockController();

    beforeEach(async () => {
      ox = new ProductModel({ name: 'OX', measure_unit: 'ml' });
      ox.save();

      client1 = new ClientModel({ name: 'Mary', phone: '999' });
      client1.save();

      professional1 = new ProfessionalModel({ name: 'Carl' });
      professional1.save();

      purchase = {
        products: [
          { id: ox._id, qty: 1000, total_price: 100 },
        ],
        seller: 'Company one',
        date: Date.now(),
      };

      const purchasesController = new PurchasesController();
      purchaseResponseFromController = await purchasesController.create(purchase);

      sale = {
        name: 'service one',
        client: client1._id,
        professional: professional1._id,
        start_time: new Date(2018, 1, 1, 10, 0),
        end_time: new Date(2018, 1, 1, 14, 0),
        payment_method: 'money',
        value: 300,
        products: [
          {
            qty: 100,
            product: ox._id,
          },
        ],
      };
      const salesController = new SalesController();
      saleResponseFromController = await salesController.create(sale);
    });

    it('returns apropriated sourceOrDestination for a purchase', async () => {
      const stock = await sut.getAll();
      // console.log(stock[0]);
      expect(stock[0].sourceOrDestination).toEqual({
        seller: purchaseResponseFromController.purchase.seller,
        purchase_id: purchaseResponseFromController.purchase._id,
      });
    });

    it('returns apropriated sourceOrDestination for a sale', async () => {
      const stock = await sut.getAll();
      expect(stock[1].sourceOrDestination).toEqual({
        name: `${saleResponseFromController.sale.name} (${client1.name})`,
        sale_id: saleResponseFromController.sale._id,
      });
    });
  });
});
