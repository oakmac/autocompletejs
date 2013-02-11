var fruits = [
  { value: { name: 'Apple', plu: 4015, inSeason: false } },
  { value: { name: 'Banana', plu: 4011, inSeason: true } },
  { value: { name: 'Orange', plu: 3037, inSeason: false } }
];

var widget = new AutoComplete('search_bar', {
  showErrors: 'console',
  lists: {
    fruits: {
      optionHTML: '{name}',
      options: fruits
    }
  }
});

$('#setValueBtn').on('click', function() {
  // invalid Token Object because the object does not have
  // a .tokenHTML property
  widget.setValue({
    value: {
      name: 'Kiwi',
      plu: 4030,
      inSeasons: false
    }
  });
});