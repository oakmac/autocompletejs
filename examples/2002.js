var config = {
  initialList: 'animals',
  lists: {
    animals: [
      { value: 'Birds', children: 'birds' },
      { value: 'Mammals', children: 'mammals' },
      { value: 'Reptiles', children: 'reptiles' }
    ],
    birds: 'api/birds.php',
    mammals: 'api/mammals.php',
    reptiles: 'api/reptiles.php'
  }
};
var widget = new AutoComplete('search_bar', config);