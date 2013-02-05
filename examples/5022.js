var containerList = {
  children: 'iceCream',
  options: ['Bowl', 'Regular Cone', 'Waffle Cone']
};

var iceCreamList = {
  children: 'toppings1',
  options: ['Chocolate', 'Strawberry', 'Vanilla']
};

var toppings1List = {
  children: 'toppings2',
  options: [
    'Caramel', 'Hot Fudge', 'Whip Cream',
    {children: false, value: 'No Toppings'}
  ]
};

var toppings2List = {
  children: 'cherry',
  options: ['Chocolate Chips', "M&M's", 'Nuts', 'Sprinkles']
};

var cherryList = ['Cherry', 'No Cherry'];

var config = {
  initialList: 'container',
  lists: {
    container: containerList,
    iceCream: iceCreamList,
    toppings1: toppings1List,
    toppings2: toppings2List,
    cherry: cherryList
  }
};
var widget = new AutoComplete('search_bar', config);