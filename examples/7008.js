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

$('#removeListBtn').on('click', function() {
  var listName = window.prompt('Which list would you like to remove?');
  if (! listName) return;

  var result = widget.removeList(listName);
  if (result === false) {
    console.log('The list "' + listName + '" was NOT removed.');
  }
  else {
    console.log('Removed list "' + listName + '".');
  }
});