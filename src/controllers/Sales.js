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

function hasProductEntriesErrors(products) {
  let errorCount = 0;

  const array = products.map(({ product, qty }) => {
    const errors = {};
    if (!product) {
      errors.product = BLANK;
      errorCount += 1;
    }
    if (!(qty > 0)) {
      errors.qty = NOT_POSITIVE;
      errorCount += 1;
    }
    return errors;
  });
  return errorCount ? array : null;
}

function hasErrors({
  name,
  client,
  professional,
  start_time,
  end_time,
  payment_method,
  value,
  products = [],
}) {
  const errors = {};

  if (!name) {
    errors.name = BLANK;
  }
  if (!client) {
    errors.client = BLANK;
  }
  if (!professional) {
    errors.professional = BLANK;
  }
  if (!start_time) {
    errors.start_time = BLANK;
  }
  if (!end_time) {
    errors.end_time = BLANK;
  }
  if (!payment_method) {
    errors.payment_method = BLANK;
  }
  if (!(value > 0)) {
    errors.value = NOT_POSITIVE;
  }

  const productErrors = hasProductEntriesErrors(products);
  if (productErrors) {
    errors.products = productErrors;
  }

  return (Object.keys(errors).length || errors.products) ? errors : null;
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
      products = [],
    } = postBody;

    const errors = hasErrors(postBody);
    if (errors) {
      return { errors };
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


    if (products.length > 0) {
      const promises = products.map(item => Promise.resolve(stock.create({
        qty: item.qty,
        product: item.product,
        sale: sale_id,
        date: start_time,
      })));

      await Promise.all(promises);
    }

    // await stock.getAll(); // ungly hack because the map for stock.create()
    // is not being waited to be completed without it

    return {
      sale: await this.getOne(sale_id),
    };
  }
}

export default Sales;
