var onChange = function(newValue, oldValue) {

  console.log("sauce");
  return newValue;
};

var foodsList = [
  { value: 'Fruits', children: 'fruits' },
  { value: 'Meats', children: 'meats' },
  { value: 'Vegetables', children: 'vegetables' }
];

var config = {
  onChange: onChange,
  initialList: 'foods',
  lists: {
    foods: foodsList,
    fruits: ['Apple', 'Banana', 'Orange'],
    meats: ['Beef', 'Chicken', 'Pork'],
    vegetables: ['Carrot', 'Lettuce', 'Onion']
  }
};
var widget = new AutoComplete('search_bar', config);