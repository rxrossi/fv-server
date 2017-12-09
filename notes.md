Next steps, server side
+ [X] Move the subdocument stock from products to is own Model, reference in on products
  + [X] Create a working controller for get all that populates stock entries
  + [X] Make the virtuals work
+ [X] Make Products integration tests work
  + [X] Fix the issue with products route test
+ [X] Make Purchases integration tests work
+ [X] extract configure server from index, it makes the test to not work correctly with jest watch

+ [X] Purchases View needs to have a link to view one
+ [X] purchases has purchase.products, it should be purchase.stockEntries
+ [X] Implement Purchases View One

+ [X] Client complains about professional.id not existing
+ [X] Client complains about `purchases[0].products[0].id` is marked as required in `View`, but its value is `undefined`. 
+ [X] product ViewOne  Warning: Each child in an array or iterator should have a unique "key" prop.
+ [X] Failed prop type: The prop `purchases[0].stockEntries[0].id` is marked as required in `View`, but its value is `undefined`
+ [X]  Each child in an array or iterator should have a unique "key" prop. in ViewOne

Then, client side
+ [ ] Write the sales feature
  + [ ] Add, lacking errors show

# Bugs

+ [ ] submiting a purchase does not clear the form
+ [ ] doing a purchase with invalid date does not show any error
+ [ ] sales does not work, probably a error with submit
+ [ ] sales on server side don't really calculate the cost of credit card
+ [ ] Submiting a sale does not add the answer to the redux store
+ [ ] Gotta be a way to check if a product has stock, if does not have it yet, probably should not be able to sell it (use on sale)
+ [ ] Seems like sale is not really adding products




# Sales
## Form fields
Name (of the sevice)
Value 
Payment form (select)
Date
Start Time
End Time
Professional
Products used (dynamic fields)


# Tips for next features
Container should fetch list, components should not, the closest possible to a dumb componenet, the better, I think...

# Doing TDD Outside in
Write a failing acceptance test, tdd actions, reducers, components, in this order, container tests does not seem nessary maybe it is better to write them on acceptance tests

# Working with stock
Stock is a list of purchases and sales, to add to it, use Purchases, to remove, use Sales or maybe Discard

-- Previous notes --

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
  stock: [
    stock_id,
  ],
}

Sales: {
  title,
  date,
  start_time,
  end_time,
  client_id,
  professional_id,
  stock: [
    stock_id
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
    product_id,
    qty,
    price,
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


