var fruits = [
  { value: { name: 'Apple', plu: 4015, inSeason: false } },
  { value: { name: 'Banana', plu: 4011, inSeason: true } },
  { value: { name: 'Orange', plu: 3037, inSeason: false } }
];

var matchOptions = function(input, matchedOptions, allOptions, value) {
  // if they have entered an exact PLU code match, show that fruit
  input = parseInt(input, 10);
  for (var i = 0; i < allOptions.length; i++) {
    if (input === allOptions[i].value.plu) {
      return [allOptions[i]];
    }
  }
  
  // else return the matched options
  return matchedOptions;
};

var config = {
  placeholderHTML: 'Enter Fruit or PLU',
  lists: {
    fruits: {
      matchOptions: matchOptions,
      optionHTML: '{name}',
      options: fruits
    }
  }
};
var widget = new AutoComplete('search_bar', config);