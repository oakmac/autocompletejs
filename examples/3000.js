var config = {
  initialValue: [['Kiwi'], ['Apple']],
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('search_bar', config);

$('#show_value_btn').on('click', function() {
  console.log("Current value of the widget:");
  console.log(widget.getValue());
});