var config = {
  initialList: 'meals',
  maxTokenGroups: 1,
  lists: {
    meals: [
      { value: 'Breakfast', children: 'breakfast' },
      { value: 'Lunch', children: 'lunch' },
      { value: 'Dinner', children: 'dinner' }
    ],
    breakfast: ['Bacon', 'Eggs', 'Waffle'],
    lunch: ['Salad', 'Sandwich', 'Soup'],
    dinner: ['Fish', 'Pasta', 'Steak']
  }
};
var widget = new AutoComplete('maxtokengroups2_example', config);