var config = {
  initialList: 'animals',
  lists: {
    animals: [
      { value: 'Birds', children: 'birds' },
      { value: 'Mammals', children: 'mammals' },
      { value: 'Reptiles', children: 'reptiles' }
    ],
    birds: 'api/birds.php?q={value}',
    mammals: 'api/mammals.php?q={value}',
    reptiles: 'api/reptiles.php?q={value}'
  }
};
var widget = new AutoComplete('search_bar', config);