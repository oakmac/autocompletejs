var usersList = {
  optionHTML: function(option) {
    return option.value.name;
  },
  options: [
    {
      value: { id: 223, name: "Emily Calhoun", gender: "female" }
    },
    {
      value: { id: 224, age: 29, name: "Katelyn Gilmore", gender: "male" }
    },
    {
      value: { id: 225, age: 36, name: "Evelyn WifKinson", gender: "male" }
    },
    {
      value: { id: 226, age: 24, name: "Hailey Chesterton", gender: "male"}
    },
    {
      value: { id: 227, age: 38, name: "Sofia Chapman", gender: "male" }
    },
    {
      value: { id: 228, age: 20, name: "Molly Carrington", gender: "male" }
    },
    {
      value: { id: 229, age: 27, name: "Grace Nathan", gender: "male" }
    }
  ]
};
var widget = new AutoComplete('val_method_get_example', {
  initialList: 'users',
  lists: {
    users: usersList
  }
});

$('#get_value_btn').on('click', function() {
  console.log("Current value of the search bar:");
  console.log(widget.val());
});