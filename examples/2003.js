var createCountryOptions = function(serverData) {
  console.log("Server data:");
  console.log(serverData);
  
  var options = [];
  var countries = serverData.countries;
  for (var i in countries) {
    if (countries.hasOwnProperty(i) !== true) continue;
    
    options.push({
      value: {
        abbr: i,
        name: countries[i]
      }
    });
  }
  
  console.log("Options array:");
  console.log(options);
  
  return options;
};

var config = {
  initialList: 'countries',
  lists: {
    countries: {
      cacheAjax: false,
      optionHTML: '{abbr} - {name}',
      preProcess: createCountryOptions,
      url: 'api/countries.php?q={value}'
    }
  }
};
var widget = new AutoComplete('search_bar', config);