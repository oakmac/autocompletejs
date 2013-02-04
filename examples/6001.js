var onChange = function(newValue, oldValue) {
  if (newValue.length < oldValue.length) {
    var msg = 'Are you sure you want to remove this fruit?';
    var sure = confirm(msg);
    if (sure !== true) {
      return oldValue;
    }
  }
  return newValue;
};

var config = {
  onChange: onChange,
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('search_bar', config);