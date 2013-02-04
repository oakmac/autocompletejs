// AutoComplete provides an HTML escape function
var encode = AutoComplete.htmlEncode;

var buildLoadingMsg = function(input) {
  if (input === '') {
    return 'Loading states&hellip;';
  }
  return 'Searching for "' + encode(input) + '"';
};

var config = {
  lists: {
    states: {
      ajaxLoadingHTML: buildLoadingMsg,
      ajaxOpts: {
        url: 'api/states.php?slow=true&q={input}'
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);