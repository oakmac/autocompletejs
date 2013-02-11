var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#clearBtn').on('click', widget.clear);