var config = {
  lists: {
    states: {
      ajaxOpts: {
        url: 'api/states.php?slow=true&q={input}'
      },
      cacheAjax: true,
      cacheAjaxSeconds: 15
    }
  }
};
var widget = new AutoComplete('search_bar', config);