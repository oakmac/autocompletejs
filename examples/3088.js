var config = {
  showErrors: 'alert',
  lists: {
    states: {
      ajaxOpts: {
        url: function(input) {
          // whoops - we forgot to return a valid URL...
          return false;
        }
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);