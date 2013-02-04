var onChange = function(newValue, oldValue) {
  console.log('Search bar updated.');
  console.log('Old Value');
  console.log(JSON.stringify(oldValue));
  console.log('New Value');
  console.log(JSON.stringify(newValue));
};

var config = {
  onChange: onChange,
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('search_bar', config);