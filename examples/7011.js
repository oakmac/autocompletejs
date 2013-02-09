var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#setValue_btn').on('click', function() {
  widget.setValue(['Kiwi']);
});