var opts = {
  initialList: 'foods',
  lists: {
    foods: [
      { value: 'Fruits', children: 'fruits' },
      { value: 'Meats', children: 'meats' },
      { value: 'Vegetables', children: 'vegetables' }
    ],

    fruits: ['Apple', 'Banana', 'Orange'],

    meats: [
	  { value: 'Beef', children: 'beef' },
	  'Chicken',
	  'Pork'
	],

    vegetables: ['Carrot', 'Lettuce', 'Onion'],

	beef: [
	  'Hamburger',
	  'Pot Roast',
	  { value: 'Steak', children: 'steak' }
	],

	steak: ['NY Strip', 'Ribeye', 'T-Bone']
  }
};
var example4 = new AutoComplete('example4', opts);