import PurchasesModel from '../models/Purchases';

export default class Purchases {
  create(purchase) {
    console.log(purchase)
    // save the purchase, remember that purchase.products wil be a virtual field, save the id
    // save each entry (purchase.products), remembering to include purchase._id
  }
}
