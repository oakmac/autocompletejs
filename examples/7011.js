var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#setValueBtn').on('click', function() {
  widget.setValue(['Kiwi']);
});