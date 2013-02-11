var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

$('#removeTokenGroupBtn').on('click', function() {
  var result = widget.removeTokenGroup(0);
  if (result === false) {
    console.log('Token Group was not removed. The widget must be empty.');
  }
  else {
    console.log('First Token Group removed. Updated value of the widget:');
    console.log(result);
  }
});