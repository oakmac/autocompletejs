var config = {
  showErrors: 'console',
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('search_bar', config);

$('#set_value_btn').on('click', function() {
  widget.setValue({
    // should be 'tokenHTML'
    tokenZTML: 'Kiwi',
    value: 'Kiwi'
  });
});