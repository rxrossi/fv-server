import { addQuantity, addAvgPriceFiveLast, addPrice } from './products';

describe('Selectors',  () => {
    const productsList = [
      {
        id: '1',
        name: 'OX',
        measure_unit: 'ml',
        stock: [
          {
            qty: 1000,
            price: 11.11,
            purchase_id: '12',
          },
          {
            qty: -150,
            price: 11.11,
            use_id: '14',
          }, // expect total to be 1000 - 150 = 850
        ],
      },
      {
        id: '2',
        name: 'Shampoo',
        measure_unit: 'ml',
        stock: [
          {
            qty: 2000,
            price: 20,
            purchase_id: '22',
          },
          {
            qty: -50,
            price: 20,
            use_id: '24',
          },
          {
            qty: 50,
            price: 22,
            purchase_id: '24',
          }, // expect total to be 2000 - 50 + 50 = 2000
        ],
      },
      {
        id: '3',
        name: 'Capes',
        measure_unit: 'unit',
        stock: [
          {
            qty: -1,
            price: 1,
            use_id: '34',
          }, // expect total to be 100 - 1 = 99
          {
            qty: 100,
            price: 1.2,
            purchase_id: '32',
          },
        ],
      },
    ];

    describe('addQuantity', () => {
      it('returns 0 when there is no stock', () => {
        const productWithoutStock = {
          id: '1',
          name: 'OX',
          measure_unit: 'ml',
          stock: [],
        }
        const expected = [{
          ...productWithoutStock,
          quantity: 0
        }];

        const actual = addQuantity([productWithoutStock])

        expect(actual).toEqual(expected);
      });

      it('shows the correct quantity for the every product of productList', () => {
        const actual = addQuantity(productsList);
        const expected = [
          { ...productsList[0], quantity: 850 },
          { ...productsList[1], quantity: 2000 },
          { ...productsList[2], quantity: 99 },
        ];

        expect(actual).toEqual(expected);
      });
    });

  describe('addPrice', () => {
    it('shows returns "" when there is no stock', () => {
      const productWithoutStock = {
        id: '1',
        name: 'OX',
        measure_unit: 'ml',
        stock: [],
      }
      const expected = [{
        ...productWithoutStock,
        price: ""
      }];

      const actual = addPrice([productWithoutStock])

      expect(actual).toEqual(expected);
    });

    it('gets the last price', () => {
      const actual = addPrice(productsList);

      const expected = [
        // assumes that stock is ordered from most recent to older
        { ...productsList[0], price: 11.11 },
        { ...productsList[1], price: 20 },
        { ...productsList[2], price: 1.2 },
      ];

      expect(actual).toEqual(expected);
    });
  });

  describe('addAvgPriceFiveLast', () => {
    it('shows returns "" when there is no stock', () => {
      const productWithoutStock = {
        id: '1',
        name: 'OX',
        measure_unit: 'ml',
        stock: [],
      }
      const expected = [{
        ...productWithoutStock,
        avgPriceFiveLast: ""
      }];

      const actual = addAvgPriceFiveLast([productWithoutStock])

      expect(actual).toEqual(expected);
    });

    it('gets the average of last five', () => {
      const product = {
        id: '1',
        name: 'Something',
        measure_unit: 'unit',
        stock: [
          { // 1
            qty: 1,
            price: 5, // per unit
          },
        {
          qty: -1,
          price: 1,
        },
        { // 2
          qty: 1,
          price: 4,
        },
          { // 3
            qty: 1,
            price: 3,
          },
          { // 4
            qty: 1,
            price: 2,
          },
          {
            qty: -3,
            price: 1,
          },
          { // 5
            qty: 10,
            price: 1,
          },
          { // discard
            qty: 10,
            price: 1,
          },
          { // discard
            qty: 10,
            price: 1,
          },
          { // discard
            qty: 10,
            price: 1,
          },
        ],
      };

      const newProductList = [
        ...productsList,
        product,
      ];

      const actual = addAvgPriceFiveLast(newProductList);

      const expected = [
        { ...newProductList[0], avgPriceFiveLast: 11.11 },
        { ...newProductList[1], avgPriceFiveLast: 21 },
        { ...newProductList[2], avgPriceFiveLast: 1.2 },
        { ...newProductList[3], avgPriceFiveLast: 3 },
      ];

      expect(actual).toEqual(expected);
    });
  });
})


