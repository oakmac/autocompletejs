var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#destroyBtn').on('click', function() {
  widget.destroy();
  $('#destroyBtn').hide();
});