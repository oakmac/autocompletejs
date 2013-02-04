var usersList = {
  optionHTML: '{name}',
  options: [
    {
      value: { id: 223, age: 22, name: "Emily Calhoun", gender: "female" }
    },
    {
      value: { id: 225, age: 36, name: "Evelyn WifKinson", gender: "female" }
    },
    {
      value: { id: 229, age: 27, name: "Grace Nathan", gender: "female" }
    },
    {
      value: { id: 226, age: 24, name: "Hailey Chesterton", gender: "female" }
    },
    {
      value: { id: 227, age: 38, name: "Justin Chapman", gender: "male" }
    },
    {
      value: { id: 228, age: 20, name: "Molly Carrington", gender: "female" }
    },
    {
      value: { id: 224, age: 29, name: "Ronald Gilmore", gender: "male" }
    }
  ]
};

var widget = new AutoComplete('search_bar', {
  errors: 'console',
  lists: {
    users: usersList
  }
});

$('#getvalue_btn').on('click', function() {
  console.log("Current value of the search bar:");
  console.log(widget.getValue());
});