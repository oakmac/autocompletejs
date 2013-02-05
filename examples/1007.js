var config = {
  initialList: 'drinks',
  lists: {
    drinks: [
      { value: 'Coffee', children: 'cream' },
      { value: 'Tea', children: 'teaOptions' },
      { value: 'Soda', children: 'sodaOptions' },
      { value: 'Water', children: 'ice' }
    ],
    cream: {
      children: 'sugar',
      options: ['Cream', 'No Cream']
    },
    sugar: ['Sugar', 'No Sugar'],
    teaOptions: ['Hot Tea', 'Iced Tea'],
    sodaOptions: ['Coke', 'Diet Coke', 'Dr Pepper', 'Sprite'],
    ice: ['Ice', 'No Ice']
  }
};
var widget = new AutoComplete('search_bar', config);