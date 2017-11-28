# Tips for next features
Container should fetch list, components should not, the closest possible to a dumb componenet, the better, I think...

# Doing TDD Outside in
Write a failing acceptance test, tdd actions, reducers, components, in this order, container tests does not seem nessary maybe it is better to write them on acceptance tests

# Working with stock
Stock is a list of purchases and sales, to add to it, use Purchases, to remove, use Sales or maybe Discard

# Purchases server side

expected response:
arrayOf(
  id,
  seller,
  date,
  products: arrayOf(
    id,
    name,
    qty,
    price,
  )
)

Models:

Purchase: {
  seller,
  date,
  products: [
    {
      product_id,
      stock_id,
    }
  ],
}

Sales: {
  title,
  date,
  start_time,
  end_time,
  client_id,
  professional_id,
  products: [
    {
      product_id,
      stock_id,
    }
  ]
}

Product.stock( // actual
  {
    id,
    qty,
    sourceOrDestination, // duplication of sale.title or purchase.seller // BAD IDEA
    date,
  }
)

Product.stock( // what I need
  {
    id,
    qty,
    sale_id,
    purchase_id,
    date,
  }
)

The above would require that purchases and/or sales are made
the response would be

Product: {
  id,
  name,
  measure_unit,
  quantity,
  stock: [
    id,
    date,
    price
    qty,
    description // of a sort of join using sale_id or purchase_id
  ]
}
