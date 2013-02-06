var buildAjaxError = function(errType) {
  if (errType === 'parsererror') {
    return 'Error parsing the JSON.<br />Do we have a bug in the code?';
  }
  if (errType === 'timeout') {
    return 'AJAX Timeout.<br />Is the network down?';
  }
  return 'AJAX Error';
};

var config = {
  lists: {
    states: {
      ajaxErrorHTML: buildAjaxError,
      ajaxOpts: {
        url: 'api/buggy.php?q={input}',
        timeout: 3000
      }
    }
  }
};
var widget = new AutoComplete('search_bar', config);