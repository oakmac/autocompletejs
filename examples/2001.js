var commonCities = ['Austin','Dallas','El Paso','Houston','San Antonio'];
var config = {
  initialList: 'cities',
  lists: {
    cities: {
      ajaxEnabled: true,
      cacheAjax: false,
      url: 'api/cities.php?state=TX&q={value}&includeCommon=false',
      options: commonCities
    }
  }
};
var widget = new AutoComplete('search_bar', config);