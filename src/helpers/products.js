export const addQuantity = products =>
  products
    .map(product => ({
      ...product,
      quantity: product.stock.reduce((prev, { qty }) => prev + qty, 0),
    }));

export const addPrice = (products) => {
  function getPrice(stock) {
    if (!stock.length) {
      return "";
    }
    return stock.find(({ qty }) => qty > 0).price;
  }
  const productsReturn = products
    .map(product => {
      product.price = getPrice(product.stock);
      console.log(product);
      return product
    });

  console.log(productsReturn)
  return productsReturn;
}

export const addAvgPriceFiveLast = (products) => {

  function avgPriceFiveLast(stock) {
    if (!stock.length) {
      return "";
    }

    const fiveLastPurchases = stock
      .filter(({ qty }) => qty > 0)
      .slice(0, 5)

    const countOfPrices = fiveLastPurchases.length;

    return fiveLastPurchases
      .reduce((prev, { price }) => prev + price, 0) / countOfPrices
  };

  return products
    .map(product => ({
      ...product,
      avgPriceFiveLast: avgPriceFiveLast(product.stock)
    }));
};
