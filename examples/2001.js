var commonCities = ['Austin','Dallas','El Paso','Houston','San Antonio'];
var config = {
  lists: {
    cities: {
      ajaxOpts: {
        url: 'api/cities.php?state=TX&q={input}&includeCommon=false'
      },
      options: commonCities
    }
  }
};
var widget = new AutoComplete('search_bar', config);