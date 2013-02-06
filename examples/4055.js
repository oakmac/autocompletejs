var config = {
  lists: {
    states: {
      ajaxErrorHTML: "<strong>Whoops!</strong><br />" +
                     "We can't connect to the server right now.<br />" +
                     "Please try again later.",
      ajaxOpts: {
        url: 'api/bad_url.php?q={input}'
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);