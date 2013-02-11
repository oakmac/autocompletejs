var config = {
  initialList: 'foods',
  lists: {
    foods: [
      { value: 'Fruits', children: 'fruits' },
      { value: 'Meats', children: 'meats' },
      { value: 'Vegetables', children: 'vegetables' }
    ],
    fruits: ['Apple', 'Banana', 'Orange'],
    meats: ['Beef', 'Chicken', 'Pork'],
    vegetables: ['Carrot', 'Lettuce', 'Onion']
  }
};
var widget = new AutoComplete('search_bar', config);

$('#getListBtn').on('click', function() {
  var listName = window.prompt('Which list would you like to see?');

  var list = widget.getList(listName);
  if (list === false) {
    console.log('The list "' + listName + '" does not exist.');
  }
  else {
    console.log('Here is list "' + listName + '":');
    console.log(list);
  }
});