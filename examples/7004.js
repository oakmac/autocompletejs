var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#focusBtn').on('click', widget.focus);