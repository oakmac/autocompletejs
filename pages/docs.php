<?php
$page_title = 'Documentation';
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
<table>
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
<tr id="config_object:initialList">
  <td><code class='js plain'>initialList</code></td>
  <td>String</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p>The <code class='js plain'>initialList</code> property is the first list started when the user clicks on the AutoComplete widget.</p>
    <p>It's value should be the name of a <a href="docs#list_object">List Object</a>.</p>
  </td>
  <td>
  </td>
</tr>
<tr id="config_object:lists">
  <td><code class='js plain'>lists</code></td>
  <td>Object of List Objects</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p>The <code class='js plain'>lists</code> property contains all of the lists used to power the dropdown options.</p>
    <p>See the <a href="docs#list_object">List Object</a> reference for more information on List Objects.</p>
  </td>
  <td>
  </td>
</tr>
<tr id="config_object:clearBtnHTML">
  <td>NOT IMPLEMENTED YET<br /><code class='js plain'>clearBtnHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><code class="js string">'foo'</code></td>
  <td>
    <p>An HTML string used for the clear button.</p>
  </td>
  <td>
  </td>
</tr>
<tr id="config_object:initialValue">
  <td><code class='js plain'>initialValue</code></td>
  <td>Array of Token Groups</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>Set the initial value of the widget.</p>
  </td>
  <td>
    <p><a href="examples#3000">initialValue</a></p>
  </td>
</tr>
<tr id="config_object:maxTokenGroups">
  <td><code class='js plain'>maxTokenGroups</code></td>
  <td>Number<br /><small>or</small><br /><code class='js keyword'>false</code></td>
  <td>no</td>
  <td><code class='js keyword'>false</code></td>
  <td>
    <p>The maximum number of token groups allowed in the search bar.</p>
    <p>Set <code class='js plain'>maxTokenGroups</code> to <code class='js keyword'>false</code> to allow unlimited token groups.</p>
  </td>
  <td>
      <p><a href="examples#3001">maxTokenGroups</a></p>
  </td>
</tr>
<tr id="config_object:onChange">
  <td><code class='js plain'>onChange</code></td>
  <td>Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>Function to execute when the value of the widget changes.</p>
    <p>The first argument to the function is the new value of the widget, the second argument is the old value of the widget.</p>
    <p>If this function returns a valid widget value, then it becomes the new value.  If not, the new value stays the same.</p>
  </td>
  <td>
      <p><a href="examples#6000">onChange - Basic Usage</a></p>
      <p><a href="examples#6001">onChange - Modify Value</a></p>
  </td>
</tr>
<tr id="config_object:placeholderHTML">
  <td>NOT IMPLEMENTED YET<br /><code class='js plain'>placeholderHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>placeholder text - how are we going to deal with placeholder behavior?</p>
  </td>
  <td>
  </td>
</tr>
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
<tr id="config_object:showErrors">
  <td><code class='js plain'>showErrors</code></td>
  <td><code class='js keyword'>false</code><br /><small>or</small><br />String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><code class='js keyword'>false</code></td>
  <td>
    <p><code class='js plain'>showErrors</code> is an optional parameter to control how AutoComplete reports errors.</p>
    <p>Every error in AutoComplete has a unique code to help diagnose problems and search for answers.</p>
    <p>If <code class='js plain'>showErrors</code> is <code class='js keyword'>false</code> then errors will be ignored.</p>
    <p>If <code class='js plain'>showErrors</code> is <code class="js string">'console'</code> then errors will be sent to <code class='js plain'>console.log()</code>.</p>
    <p>If <code class='js plain'>showErrors</code> is <code class="js string">'alert'</code> then errors will annoyingly be sent to <code class='js plain'>window.alert()</code>.</p>
    <p>If <code class='js plain'>showErrors</code> is a function then the first argument is the unique error code, the second argument is an error string, and an optional third argument is a data structure that is relevant to the error.</p>
  </td>
  <td>
    <p><a href="examples#3012">showErrors console.log</a></p>
    <p><a href="examples#3088">showErrors alert</a></p>
  </td>
</tr>
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
<table class="table table-striped">
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
<table class="table table-striped">
<thead>
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Required</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
</thead>
<tbody>
<tr id="option_object:children">
  <td><code class='js plain'>children</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>If specified, <code class='js plain'>children</code> should be the name of a List Object.</p>
    <p>When the option is selected from the dropdown, <code class='js plain'>children</code> is the name of the next list to show.</p>
    <p>Note: This <code class='js plain'>children</code> property will supersede a <code class='js plain'>children</code> property on the parent List Object.</p>
  </td>
  <td>
    <p><a href="examples#1002">Multiple Lists</a></p>
    <p><a href="examples#1003">Nested Lists</a></p>
  </td>
</tr>
<tr id="option_object:group">
  <td><code class='js plain'>group</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>You can group options into sections using the <code class='js plain'>group</code> property.</p>
    <p>Options without groups get displayed first, followed by options with groups.</p>
    <p>You can control the sort order of groups with the <code class='js plain'>groupSort</code> property on the parent List Object.</p>
  </td>
  <td>
    <p><a href="examples#1012">Grouped List</a></p>
  </td>
</tr>
<tr id="option_object:optionHTML">
  <td><code class='js plain'>optionHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>An HTML string to show inside the dropdown.</p>
    <p>This <code class='js plain'>optionHTML</code> property will supersede an <code class='js plain'>optionHTML</code> function on the parent list.</p>
    <p>If there is no <code class='js plain'>optionHTML</code> on the option and there is no <code class='js plain'>optionHTML</code> on the parent list and <code class='js plain'>value</code> is a string, then <code class='js plain'>optionHTML</code> gets an HTML-escaped <code class='js plain'>value</code>.</p>
  </td>
  <td></td>
</tr>
<tr id="option_object:tokenHTML">
  <td><code class='js plain'>tokenHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>An HTML string to show inside the search bar.</p>
    <p>This <code class='js plain'>tokenHTML</code> property will supersede a <code class='js plain'>tokenHTML</code> property on the parent list.</p>
    <p>If there is no <code class='js plain'>tokenHTML</code> on the option and there is no <code class='js plain'>tokenHTML</code> on the parent <code class='js plain'>tokenHTML</code> gets the value of <code class='js plain'>optionHTML</code>.</p>
  </td>
  <td></td>
</tr>
<tr id="option_object:value">
  <td><code class='js plain'>value</code></td>
  <td>String, Number, Array, or Object</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class='js plain'>value</code> is what gets saved when the user selects the option.</p>
    <p><code class='js plain'>value</code> can be anything that is safe to call <code class='js plain'>JSON.stringify()</code> on.</p>
  </td>
  <td></td>
</tr>
</tbody>
</table>

<h2 id="methods">AutoComplete Methods</h2>
<p>Each AutoComplete object has methods you can use to interact with the widget.</p>
<table class="table table-striped">
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
  return 'yes';
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