var config = {
  lists: {
    states: {
      ajaxOpts: {
        url: 'api/states.php?q={input}'
      },
      cacheAjax: true
    }
  }
};
var widget = new AutoComplete('search_bar', config);