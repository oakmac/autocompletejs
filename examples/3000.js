var config = {
  initialList: 'fruits',
  initialValue: [['Kiwi'], ['Apple']],
  lists: {
    fruits: ['Apple', 'Banana', 'Orange']
  }
};
var widget = new AutoComplete('initialvalue1_example', config);

$('#show_initialvalue1_value_btn').on('click', function() {
  console.log(widget.getValue());
});