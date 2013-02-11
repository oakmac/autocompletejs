var fruits = [
  { value: { name: 'Apple', plu: 4015, inSeason: false } },
  { value: { name: 'Banana', plu: 4011, inSeason: true } },
  { value: { name: 'Orange', plu: 3037, inSeason: false } }
];

var widget = new AutoComplete('search_bar', {
  lists: {
    fruits: {
      optionHTML: '{name}',
      options: fruits
    }
  }
});

$('#showValueBtn').on('click', function() {
  console.log("Current value of the search bar:");
  console.log(widget.getValue());
});