var config = {
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
var widget = new AutoComplete('nested_lists_example', config);