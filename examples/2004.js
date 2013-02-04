var buildAjaxOpts = function(input) {
  return {
    data: {
      username: 'admin',
      password: 'secret1',
      q: input
    },
    type: 'POST',
    url: 'api/secret_users.php'
  };
};

var config = {
  lists: {
    users: {
      ajaxOpts: buildAjaxOpts,
      optionHTML: '{username}'
    }
  }
};
var widget = new AutoComplete('search_bar', config);