var initialUsers = [
  [{
    tokenHTML: 'Avery Milton',
    value: {
      id: 82731,
      name: 'Avery Milton',
      role: 'superuser'
    }
  }]
];

var usersList = {
  optionHTML: function(option) {
    return option.value.name;
  },
  options: [
    {
      value: { id: 28292, name: 'Grace Gardner', role: 'admin' }
    },
    {
      value: { id: 89221, name: 'Isabelle Stanley', role: 'user' }
    },
    {
      value: { id: 28372, name: 'Maya Turner', role: 'user' }
    },
    {
      value: { id: 17283, name: 'Morgan Charlson', role: 'user' }
    }
  ]
};

var config = {
  initialList: 'users',
  initialValue: initialUsers,
  lists: {
    users: usersList
  }
};
var widget = new AutoComplete('initialvalue2_example', config);

$('#show_initialvalue2_value_btn').on('click', function() {
  console.log(widget.getValue());
});