var foods = [
  { value: 'Fruits', children: 'fruits' },
  { value: 'Meats', children: 'meats' },
  { value: 'Vegetables', children: 'vegetables' }
];
var fruits = ['Apple', 'Banana', 'Orange'];
var meats = [
  { value: 'Beef', children: 'beef' },
  'Chicken',
  'Pork'
];
var vegetables = ['Carrot', 'Lettuce', 'Onion'];
var beef = [
  'Hamburger',
  'Pot Roast',
  { value: 'Steak', children: 'steak' }
];
var steak = ['NY Strip', 'Ribeye', 'T-Bone'];

var config = {
  initialList: 'foods',
  lists: {
    foods: foods,
    fruits: fruits,
    meats: meats,
    vegetables: vegetables,
    beef: beef,
    steak: steak
  }
};
var widget = new AutoComplete('search_bar', config);