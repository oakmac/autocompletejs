var config = {
  initialList: 'states',
  showErrors: 'alert',
  lists: {
    states: {
      ajaxEnabled: true,
      url: function(input) {
        // whoops - we forgot to return a valid URL...
        return false;
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);