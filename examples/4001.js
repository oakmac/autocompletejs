var config = {
  initialList: 'meals',
  lists: {
    meals: [
      { value: 'Breakfast', children: 'breakfast' },
      { value: 'Lunch', children: 'lunch' },
      { value: 'Dinner', children: 'dinner' }
    ],

    breakfast: {
      allowFreeform: false, // NOTE: this is the default
      options: ['Bacon', 'Eggs', 'Pancake', 'Waffle']
    },

    lunch: {
      allowFreeform: true,
      options: ['Calzone', 'Hot dog', 'Greek Salad', 'Panini', 'Turkey Sandwich']
    },

    dinner: {
      allowFreeform: true
    }
  }
};
var widget = new AutoComplete('search_bar', config);