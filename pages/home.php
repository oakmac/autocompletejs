<?php
$page_title = 'Home';
$active_nav_tab = 'Home';
include(APP_PATH . 'pages/header.php');
?>

<!--<p>I'm working on the most wonderful homepage, but for now you'll just have to live with <a href="examples">Examples</a> and <a href="docs">Docs</a>.</p>-->
<div id="awesome"></div>

<script src="js/json3.min.js"></script>
<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

var config = {
  tokenSeparatorHTML: '',
  initialList: 'subject',
  lists: {
    subject: [{
      children: 'predicate',
      value: 'AutoCompleteJS is'
    }],
    predicate: {
      options: [
        'the best!',
        'so sweet.',
        'amazing!',
        {
          children: 'predicate2',
          value: 'better than'
        }
      ]
    },
    predicate2: {
      options: [
        'your middle school dance.',
        'sliced bread.',
        'your grammy, your aunty, your momma, your mammy.',
        'Ezra.'
      ]
    }
  }
};
var awesome = new AutoComplete('awesome', config);

// TODO: would prefer to have some randomness here instead
//       of the same thing every time

var actions = [
  function() { awesome.setInput('a'); },
  function() { awesome.setInput('au'); },
  function() { awesome.setInput('aut'); },
  function() { awesome.setInput('auto'); },
  function() { awesome.pressEnter(); },
  function() { awesome.setInput('a'); },
  function() { awesome.setInput('am'); },
  function() { awesome.setInput('a'); },
  function() { awesome.setInput(''); },
  function() { awesome.setInput('b'); },
  function() { awesome.setInput('be'); },
  function() { awesome.setInput('bet'); },
  function() { awesome.setInput('bett'); },
  function() { awesome.pressEnter(); },
  function() { awesome.setInput('s'); },
  function() { awesome.setInput('sl'); },
  function() { awesome.setInput('sli'); },
  function() { awesome.pressEnter(); },
  function() { awesome.pressDown(); },
  function() { awesome.pressEnter(); },
  function() { awesome.blur(); }
];

var go = function() {
  var interval = 500;
  for (var i = 0; i < actions.length; i++) {
    setTimeout(actions[i], i * interval);
  }
};

setTimeout(go, 500);

}; // end init()
$(document).ready(init);
</script>
<?php
include(APP_PATH . 'pages/footer.php');
?>