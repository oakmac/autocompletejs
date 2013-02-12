var fruits = ['Apple', 'Banana', 'Orange'];
var widget = new AutoComplete('search_bar', fruits);

var actions = [
  function() { $('#runBtn').css('visibility', 'hidden'); },
  function() { widget.setInput('a'); },
  function() { widget.setInput('ap'); },
  function() { widget.setInput('app'); },
  function() { widget.pressEnter(); },
  function() { widget.setInput('o'); },
  function() { widget.setInput('on'); },
  function() { widget.setInput('ong'); },
  function() { widget.pressEnter(); },
  function() { widget.pressUp(); },
  function() { widget.pressUp(); },
  function() { widget.pressEnter(); },
  function() { widget.blur(); },
  function() { $('#runBtn').css('visibility', 'visible'); }
];

var simulate = function() {
  var interval = 500;
  for (var i = 0; i < actions.length; i++) {
    setTimeout(actions[i], i * interval);
  }
};

$('#runBtn').on('click', simulate);
setTimeout(simulate, 750);