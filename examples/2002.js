var config = {
  initialList: 'animals',
  lists: {
    animals: [
      { value: 'Birds', children: 'birds' },
      { value: 'Mammals', children: 'mammals' },
      { value: 'Reptiles', children: 'reptiles' }
    ],
    birds: 'api/birds.php?q={input}',
    mammals: 'api/mammals.php?q={input}',
    reptiles: 'api/reptiles.php?q={input}'
  }
};
var widget = new AutoComplete('search_bar', config);