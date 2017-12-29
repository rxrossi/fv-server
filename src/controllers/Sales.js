import SalesModel from '../models/Sales';
import StockController from '../controllers/Stock';
import { BLANK, NOT_POSITIVE } from '../errors';

const stock = new StockController();

function calcProfit(sale) {
  const costOfProducts = sale.stockEntries
    .reduce((prevVal, entry) => prevVal + (entry.price_per_unit * entry.qty), 0);

  return {
    ...sale,
    profit: sale.payment.value_liquid - costOfProducts,
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
      .then(sales => sales.map(sale => calcProfit(sale)));
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
      .then(sale => calcProfit(sale));
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
    products.forEach(({ product, qty }) => {
      const errors = {};
      if (!product) {
        errors.product = BLANK;
      }
      if (!(qty > 0)) {
        errors.qty = NOT_POSITIVE;
      }
      if (Object.keys(errors).length) {
        errorOfProducts.push(errors);
      }
    });

    if (Object.keys(errors).length || errorOfProducts.length) {
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

    products.map(item =>
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
