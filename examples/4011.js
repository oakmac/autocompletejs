var config = {
  lists: {
    states: {
      ajaxLoadingHTML: 'Loading states&hellip;',
      ajaxOpts: {
        url: 'api/states.php?slow=true&q={input}'
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);