var config = {
  initialList: 'fruits',
  maxTokenGroups: 3,
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('search_bar', config);