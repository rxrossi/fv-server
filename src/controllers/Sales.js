import SalesModel from '../models/Sales';
import StockController from '../controllers/Stock';
import { BLANK, NOT_POSITIVE } from '../errors';

const pad2 = x => (x > 9 ? x.toString() : `0${x}`);
const stock = new StockController();

function calcProfit(sale) {
  const costOfProducts = sale.stockEntries
    .reduce((prevVal, entry) => prevVal + (entry.price_per_unit * entry.qty), 0);

  return {
    ...sale,
    profit: sale.payment.value_liquid - costOfProducts,
  };
}

function calcSpentTime(sale) {
  const TimeSpent = new Date(sale.end_time - sale.start_time);

  return {
    ...sale,
    time_spent: `${TimeSpent.getHours()}:${pad2(TimeSpent.getMinutes())}`,
  };
}

function calcProfitPerHour(sale) {
  const TimeSpent = new Date(sale.end_time - sale.start_time);
  const hours = TimeSpent.getHours() + (TimeSpent.getMinutes() / 60);
  const profit_per_hour = (sale.profit / hours).toFixed(2);

  return {
    ...sale,
    profit_per_hour,
  };
}

class Sales {
  constructor() {
    this.Model = SalesModel;
  }

  getAll() {
    return this.Model.find({})
      .sort({ start_time: 'descending' })
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
        },
      })
      .populate('client')
      .populate('professional')
      .then(sales => sales.map(sale => sale.toObject()))
      .then(sales => sales.map(sale => calcProfit(sale)))
      .then(sales => sales.map(sale => calcSpentTime(sale)))
      .then(sales => sales.map(sale => calcProfitPerHour(sale)));
  }

  getOne(id) {
    return this.Model.findById(id)
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
        },
      })
      .populate('client')
      .populate('professional')
      .then(sale => sale.toObject())
      .then(sale => calcProfit(sale))
      .then(sale => calcSpentTime(sale))
      .then(sale => calcProfitPerHour(sale));
  }

  async create(postBody) {
    const {
      name,
      client,
      professional,
      start_time,
      end_time,
      payment_method,
      value,
      products,
    } = postBody;

    // error cheching
    const errors = {};
    // for name
    if (!name) {
      errors.name = BLANK;
    }
    // client
    if (!client) {
      errors.client = BLANK;
    }
    // professional
    if (!professional) {
      errors.professional = BLANK;
    }
    // start_time
    if (!start_time) {
      errors.start_time = BLANK;
    }
    // end_time
    if (!end_time) {
      errors.end_time = BLANK;
    }
    // payment_method
    if (!payment_method) {
      errors.payment_method = BLANK;
    }
    // value
    if (!(value > 0)) {
      errors.value = NOT_POSITIVE;
    }

    const errorOfProducts = [];
    let productErrorsCount = 0;
    products && products.forEach(({ product, qty }) => {
      const errors = {};
      if (!product) {
        errors.product = BLANK;
        productErrorsCount += 1;
      }
      if (!(qty > 0)) {
        errors.qty = NOT_POSITIVE;
        productErrorsCount += 1;
      }
      errorOfProducts.push(errors);
    });

    if (Object.keys(errors).length || productErrorsCount) {
      return {
        errors: {
          ...errors,
          products: errorOfProducts,
        },
      };
    }

    const paymentFullInfo = {
      value_liquid: value,
      value_total: value,
      method: payment_method,
      avaiable_at: start_time,
      discount: 'none',
    };

    const sale = new this.Model({
      name,
      client,
      professional,
      start_time,
      end_time,
      payment: paymentFullInfo,
    });

    const { id: sale_id } = await sale.save();

    products && products.map(item =>
      stock.create({
        qty: item.qty,
        product: item.product,
        sale: sale_id,
        date: start_time,
      }));
    await stock.getAll(); // ungly hack because the map for stock.create()
    // is not being waited to be completed without it

    return {
      sale: await this.getOne(sale_id),
    };
  }
}

export default Sales;
