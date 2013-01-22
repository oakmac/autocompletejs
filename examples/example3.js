var opts = {
  initialList: 'foods',
  lists: {
    foods: [
      { value: 'Fruits', children: 'fruits' },
      { value: 'Meats', children: 'meats' },
      { value: 'Vegetables', children: 'vegetables' }
    ],

    fruits: ['Apple', 'Banana', 'Orange'],

    meats: ['Beef', 'Chicken', 'Pork'],

    vegetables: ['Carrot', 'Lettuce', 'Onion']
  }
};
var example3 = new AutoComplete('example3', opts);