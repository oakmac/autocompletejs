var users = [
  {value: { name: 'Brent', username: 'brentf', admin: true }},
  {value: { name: 'Ronnie', username: 'ronnief' }},
  {value: { name: 'Phil', username: 'philg' }},
  {value: { name: 'Chris', username: 'chriso', admin: true }},
  {value: { name: 'Katie', username: 'katief' }},
  {value: { name: 'Jeff', username: 'jeffp' }},
  {value: { name: 'Fred', username: 'freda' }},
  {value: { name: 'Denise', username: 'denisea', admin: true }},
  {value: { name: 'Aaron', username: 'aaronp' }}
];

// AutoComplete provides this convenience method for you
var encode = AutoComplete.htmlEncode;

var buildOption = function(option) {
  var html = '';
  if (option.value.admin === true) {
    html += '<span class="label">Admin</span> ';
  }
  html += encode(option.value.name) +
    ' (' + encode(option.value.username) + ')';
  return html;
};

var buildToken = function(option) {
  html = encode(option.value.username);
  
  // mark the username if they are an admin
  if (option.value.admin === true) {
    html += ' (A)';
  }
  return html;
};

var config = {
  placeholderHTML: 'Select Users',
  lists: {
    users: {
      optionHTML: buildOption,
      tokenHTML: buildToken,
      options: users
    }
  }
};
var widget = new AutoComplete('search_bar', config);