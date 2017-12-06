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
      payment,
      stockEntries,
    } = postBody;

    const newPayment = {
      ...payment,
      value_liquid: payment.value_total,
      avaiable_at: start_time,
      discount: 'none',
    };

    const sale = new this.Model({
      name,
      client,
      professional,
      start_time,
      end_time,
      payment: newPayment,
    });

    const { id: sale_id } = await sale.save();

    await stockEntries.map(async (item) => {
      await stock.create({
        qty: item.qty,
        product: item.product,
        price: item.price,
        sale: sale_id,
        date: postBody.start_time,
      });
    });

    return this.getOne(sale_id);
  }
}

export default Sales;
