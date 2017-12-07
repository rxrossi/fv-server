import SalesModel from '../models/Sales';
import StockController from '../controllers/Stock';

const stock = new StockController();

function calcProfit(sale) {
  const costOfProducts = sale.stockEntries
    .reduce((prevVal, entry) => prevVal + entry.price, 0);

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
      .populate({
        path: 'stockEntries',
        populate: {
          path: 'product',
          select: 'name measure_unit',
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
          select: 'name measure_unit',
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
      date,
      payment_method,
      value,
      products,
    } = postBody;

    const paymentFullInfo = {
      value_liquid: value,
      value_total: value,
      method: payment_method,
      avaiable_at: date,
      discount: 'none',
    };

    const sale = new this.Model({
      name,
      client,
      professional,
      start_time: Number(start_time.replace(':', '')),
      end_time: Number(end_time.replace(':', '')),
      date,
      payment: paymentFullInfo,
    });

    const { id: sale_id } = await sale.save();

    await products.map(async (item) => {
      await stock.create({
        qty: item.qty,
        product: item.product,
        sale: sale_id,
        date,
      });
    });

    return this.getOne(sale_id);
  }
}

export default Sales;
