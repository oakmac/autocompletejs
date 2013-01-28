var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('onchange_event_example', fruits);

widget.onChange = function(oldValue, newValue) {
  console.log("Search bar updated.");
  console.log("Old value:");
  console.log(oldValue);
  console.log("New value:");
  console.log(newValue);
};
