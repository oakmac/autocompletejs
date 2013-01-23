var opts = {
  initialList: 'meals',
  lists: {
    meals: [
      { value: 'Breakfast', children: 'breakfast' },
      { value: 'Lunch', children: 'lunch' },
      { value: 'Dinner', children: 'dinner' }
    ],

    breakfast: {
      allowFreeform: false, // NOTE: this is the default
      values: ['Bacon', 'Eggs', 'Pancake', 'Waffle']
    },

    lunch: {
      allowFreeform: true,
      values: ['Calzone', 'Hot dog', 'Greek Salad', 'Panini', 'Turkey Sandwich']
    },

    dinner: {
      allowFreeform: true
    }
  }
};
var example5 = new AutoComplete('example5', opts);