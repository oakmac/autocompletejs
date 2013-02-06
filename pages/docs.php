<?php
$page_title = 'Documentation';
$active_nav_tab = 'Docs';
include(APP_PATH . 'pages/header.php');
$examples = AC::getExamples();
$docs = AC::getDocs();
?>

<div class="row">
<div class="twelve columns">

<!--
TODO: "how it works" walk-through explanation of how the widget functions
      including definitions of widget, tokens, lists, and options
-->

<h2 id="config_object">AutoComplete Config Object</h2>
<p>The Config Object initializes the AutoComplete widget.</p>
<table cellspacing="0">
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
    <th>Example</th>
  </tr>
</thead>
<tbody>
<?php
foreach($docs['Config Object'] as $prop) {
  if (is_array($prop) !== true) continue;
  echo buildPropRow('config_object', $prop, $examples);
}
?>
<!--
<tr id="config_object:removeTokenGroupHTML">
  <td>NOT IMPLEMENTED YET<br /><code class='js plain'>removeTokenGroupHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><code class="js string">'foo'</code></td>
  <td>
    <p>An HTML string used to clear a token group.</p>
    <p>Set <code class='js plain'>removeTokenGroupHTML</code> to <code class='js keyword'>false</code> to not show a clear button.</p>
  </td>
  <td>
  </td>
</tr>
<tr id="config_object:showClearBtn">
  <td>NOT IMPLEMENTED YET<br /><code class='js plain'>showClearBtn</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class='js keyword'>true</code></td>
  <td>
    <p>Toggle to show the clear button in the search bar.</p>
  </td>
  <td>
  </td>
</tr>
-->
</tbody>
</table>

<h2 id="list_object">List Object</h2>

<div class="panel">
<div class="etymology">
  <div class="word">list</div>
  <div class="part-of-speech">Noun</div>
  <div class="definition">A number of connected items or names written or printed consecutively, typically one below the other.</div>
</div>
</div>

<p>List Objects are the heart and soul of the AutoComplete widget. They define the options available to the user when they are typing.</p>
<p>The options for a List Object can be sourced directly in the JavaScript or externally with AJAX.</p>
<p>You can define the list workflow using the <code class='js plain'>children</code> property on List Objects.</p>
<table cellspacing="0">
<thead>
<tr>
  <th>Property</th>
  <th>Type</th>
  <th>Required</th>
  <th>Default</th>
  <th>Description</th>
  <th>Example</th>
</tr>
</thead>
<tbody>
<?php
foreach($docs['List Object'] as $prop) {
  if (is_array($prop) !== true) continue;
  echo buildPropRow('list_object', $prop, $examples);
}
?>
</tbody>
</table>

<h2 id="option_object">Option Object</h2>
<div class="etymology">
  <div class="word">option</div>
  <div class="part-of-speech">Noun</div>
  <div class="definition">A thing that is or may be chosen.</div>
</div>
<p>Option Objects are the "meat" of the AutoComplete widget. They are the options displayed to the user as they type.</p>
<p>You can define the list workflow using the <code class='js plain'>children</code> property on Option Objects.</p>
<table cellspacing="0">
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
    <th>Example</th>
  </tr>
</thead>
<tbody>
<?php
  foreach($docs['Option Object'] as $prop) {
  if (is_array($prop) !== true) continue;
  echo buildPropRow('option_object', $prop, $examples);
}
?>
</tbody>
</table>

<h2 id="methods">AutoComplete Methods</h2>
<p>Each AutoComplete object has methods you can use to interact with the widget.</p>
<table cellspacing="0">
<thead>
<tr>
  <th>Method</th>
  <th>Args</th>
  <th>Description</th>
  <th>Example</th>
</tr>
</thead>
<tbody>
<?php
foreach($docs['Methods'] as $method) {
  if (is_array($method) !== true) continue;
  echo buildMethodRow($method, $examples);
}
?>
</tbody>
</table>

</div><!-- end .twelve.columns -->
</div><!-- end div.row -->

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/jquery.color.min.js"></script>
<script>
var flashRow = function(id) {
  var el = $(document.getElementById(id));
  var bgColor = el.css('background-color');
  el.css('background-color', '#ffff99')
    .animate({backgroundColor: bgColor}, 2000);
};

var isRow = function(id) {
  return id.search(/\:/) !== -1;
};

var clickAnchor = function(e) {
  var id = $(this).attr('href').replace(/docs#/, '');
  if (isRow(id) === true) {
    flashRow(id);
  }
};

var init = function() {
  $('body').on('click', 'a', clickAnchor);

  if (isRow(window.location.hash) === true) {
    flashRow(window.location.hash.replace('#', ''));
  }
};

$(document).ready(init);
</script>

<?php
include(APP_PATH . 'pages/footer.php');

//------------------------------------------------------------------------------
// Functions
//------------------------------------------------------------------------------

// NOTE: I know the spaces and linebreaks here are annoying and unnecessary
//       I'm optimizing for "View Source"

function buildPropRow($propType, $prop, $examples) {
  $html = '';

  // table row
  $html .= '<tr id="'.$propType.':'.$prop['name'].'">'."\n";

  // name
  $html .= '  <td><code class="js plain">'.$prop['name'].'</code></td>'."\n";

  // type
  $html .= '  <td>'.buildType($prop['type']).'</td>'."\n";

  // required
  $html .= '  <td>'.buildReq($prop['req']).'</td>'."\n";

  // default
  $html .= '  <td>'.buildDefault($prop['default']).'</td>'."\n";

  // description
  $html .= '  <td>'."\n";
  $html .= buildDesc($prop['desc']);
  $html .= '  </td>'."\n";

  // examples
  $html .= '  <td>'."\n";
  $html .= buildExample($prop['examples'], $examples);
  $html .= '  </td>'."\n";

  $html .= '</tr>'."\n";

  return $html;
}

function buildMethodRow($method, $examples) {
  $nameNoParens = preg_replace('/\(.+$/', '', $method['name']);

  $html = '';

  // table row
  if (array_key_exists('noId', $method) === true) {
    $html .= "<tr>\n";
  }
  else {
    $html .= '<tr id="methods:'.$nameNoParens.'">'."\n";
  }

  // name
  $html .= '  <td><code class="js plain">'.$method['name'].'</code></td>'."\n";

  // args
  if (array_key_exists('args', $method) === true) {
    $html .= '  <td>'."\n";
    foreach ($method['args'] as $arg) {
      $html .= '    <p><code class="js plain">'.$arg[0].'</code> - '.$arg[1].'</p>'."\n";
    }
    $html .= '  </td>'."\n";
  }
  else {
    $html .= '  <td><small>n/a</small></td>'."\n";
  }

  // description
  $html .= '  <td>'."\n";
  $html .= buildDesc($method['desc']);
  $html .= '  </td>'."\n";

  // examples
  $html .= '  <td>'."\n";
  $html .= buildExample($method['examples'], $examples);
  $html .= '  </td>'."\n";

  $html .= "</tr>\n";

  return $html;
}

function getExampleByNumber($number, $examples) {
  $number = (int) $number;
  foreach ($examples as $ex) {
    if (intval($ex['number'], 10) === $number &&
        $ex['js'] !== '') {
      return $ex;
    }
  }
  return false;
}

function buildType($type) {
  if (is_array($type) !== true) {
    $type = array($type);
  }

  $html = '';
  for ($i = 0; $i < count($type); $i++) {
    if ($i !== 0) {
      $html .= '<br /><small>or</small><br />';
    }
    $html .= $type[$i];
  }

  return $html;
}

function buildReq($req) {
  if ($req === false) {
    return 'no';
  }
  if ($req === true) {
    return 'yes';
  }
  return $req;
}

function buildDesc($desc) {
  if (is_array($desc) !== true) {
    $desc = array($desc);
  }
  $html = '';
  foreach ($desc as $d) {
    $html .= '    <p>'.$d.'</p>'."\n";
  }
  return $html;
}

function buildDefault($default) {
  if ($default === false) {
    return '<small>n/a</small>';
  }
  return $default;
}

function buildExample($ex, $allExamples) {
  if (is_array($ex) !== true) {
    $ex = array($ex);
  }

  $html = '';
  foreach ($ex as $exNum) {
    $example = getExampleByNumber($exNum, $allExamples);
    if ($example === false) continue;

    $html .= '    <p><a href="examples#'.$exNum.'">'.$example['name'].'</a></p>'."\n";
  }
  return $html;
}

?>