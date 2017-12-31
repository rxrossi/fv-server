# Server
## General
+ [x] Verification of name unique is a fuzzy search instead of just case insensitive
  + [X] done on clients, checked [X]
  + [X] done on professionals, checked [x]
  + [X] done on products, checked [x]
+ [X] clients, professionals, products should be ordered by name
  + [X] done on clients, checked [X]
  + [X] done on professionals, checked [X]
  + [X] done on products, checked [X]
+ [X] Sales and purchases from the most recent to the older
  + [X] for purchases
  + [X] needs to work on fields os sales first, probably will order by start_time

## Purchases
+ [ ] Purchases view one shows incorrect value

## Sales
+ [ ] Sales don't really calculate the cost of credit card
+ [X] Sales product errors, if the first product is filled correctly, the array of product errors does not come with a empty object, making 2nd set of errors to appear on first product
+ [X] Check if sales post is returning errors
+ [X] Sales add will receive datetime for start_time and end_time instead of the three fields
+ [X] Sales should also return a the fields: time_spent, profit_per_hour

## Professionals features
+ [ ] Should list total profit 
