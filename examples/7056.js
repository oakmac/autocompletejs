var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

var actions = [
  function() { widget.setInput('a'); },
  function() { widget.setInput('ap'); },
  function() { widget.setInput('app'); },
  function() { widget.pressEnter(); },
  function() { widget.setInput('o'); },
  function() { widget.pressEnter(); },
  function() { widget.pressUp(); },
  function() { widget.pressUp(); },
  function() { widget.pressUp(); },
  function() { widget.pressEnter(); },
  function() { widget.blur(); }
];

var wait = 1000;
var interval = 300;
for (var i = 0; i < actions.length; i++) {
  setTimeout(actions[i], wait);
  wait += interval;
}