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

$('#getvalue_btn').on('click', function() {
  console.log("Current value of the search bar:");
  console.log(widget.getValue());
});

$('#addoption_btn').on('click', function() {
  var kiwi = {
    value: { name: 'Kiwi', plu: 4030, inSeason: false }
  };
  widget.addOption('fruits', kiwi);
  
  $('#addoption_btn').css('display', 'none');
});