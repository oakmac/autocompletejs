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
  <td><code class="js plain">initialList</code></td>
  <td>String</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p>The <code class="js plain">initialList</code> property is the first list started when the user clicks on the AutoComplete widget.</p>
    <p>It's value should be the name of a <a href="docs#list_object">List Object</a>.</p>
  </td>
  <td>
      <p><a href="example/basic_list">Basic List</a></p>
      <p><a href="example/nested_lists1">Nested Lists 1</a></p>
      <p><a href="example/nested_lists2">Nested Lists 2</a></p>
  </td>
</tr>
<tr id="config_object:lists">
  <td><code class="js plain">lists</code></td>
  <td>Object of List Objects</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p>The <code class="js plain">lists</code> property contains all of the lists used to power the dropdown options.</p>
    <p>See the <a href="docs#list_object">List Object</a> reference for more information on List Objects.</p>
  </td>
  <td>
      <p><a href="example/basic_list">Basic List</a></p>
      <p><a href="example/nested_lists1">Nested Lists 1</a></p>
      <p><a href="example/nested_lists2">Nested Lists 2</a></p>
  </td>
</tr>
<tr id="config_object:clearBtnHTML">
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">clearBtnHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><code class="js string">'foo'</code></td>
  <td>
    <p>An HTML string used for the clear button.</p>
  </td>
  <td>
    <p><a href="#">clearBtnHTML Example</a></p>
  </td>
</tr>
<tr id="config_object:initialValue">
  <td><code class="js plain">initialValue</code></td>
  <td>Array of Token Groups</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>Set the initial value of the widget.</p>
  </td>
  <td>
      <p><a href="example/initialvalue1">initialValue Example 1</a></p>
      <p><a href="example/initialvalue2">initialValue Example 2</a></p>
  </td>
</tr>
<tr id="config_object:maxTokenGroups">
  <td><code class="js plain">maxTokenGroups</code></td>
  <td>Number<br /><small>or</small><br /><code class="js keyword">false</code></td>
  <td>no</td>
  <td><code class="js keyword">false</code></td>
  <td>
    <p>The maximum number of token groups allowed in the search bar.</p>
    <p>Set <code class="js plain">maxTokenGroups</code> to <code class="js keyword">false</code> to allow unlimited token groups.</p>
  </td>
  <td>
      <p><a href="examples#3001">maxTokenGroups</a></p>
  </td>
</tr>
<tr id="config_object:onChange">
  <td><code class="js plain">onChange</code></td>
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
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">placeholderHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>placeholder text - how are we going to deal with placeholder behavior?</p>
  </td>
  <td>
    <p><a href="#">Placeholder Example</a></p>
  </td>
</tr>
<tr id="config_object:removeTokenGroupHTML">
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">removeTokenGroupHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><code class="js string">'foo'</code></td>
  <td>
    <p>An HTML string used to clear a token group.</p>
    <p>Set <code class="js plain">removeTokenGroupHTML</code> to <code class="js keyword">false</code> to not show a clear button.</p>
  </td>
  <td>
    <p><a href="#">removeTokenGroupHTML Example</a></p>
  </td>
</tr>
<tr id="config_object:showClearBtn">
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">showClearBtn</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class="js keyword">true</code></td>
  <td>
    <p>Toggle to show the clear button in the search bar.</p>
  </td>
  <td>
    <p><a href="#">showClearBtn Example</a></p>
  </td>
</tr>
<tr id="config_object:showErrors">
  <td><code class="js plain">showErrors</code></td>
  <td><code class="js keyword">false</code><br /><small>or</small><br />String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><code class="js keyword">false</code></td>
  <td>
    <p><code class="js plain">showErrors</code> is an optional parameter to control how AutoComplete reports errors.</p>
    <p>Every error in AutoComplete has a unique code to help diagnose problems and search for answers.</p>
    <p>If <code class="js plain">showErrors</code> is <code class="js keyword">false</code> then errors will be ignored.</p>
    <p>If <code class="js plain">showErrors</code> is <code class="js string">'console'</code> then errors will be sent to <code class="js plain">console.log()</code>.</p>
    <p>If <code class="js plain">showErrors</code> is <code class="js string">'alert'</code> then errors will annoyingly be sent to <code class="js plain">window.alert()</code>.</p>
    <p>If <code class="js plain">showErrors</code> is a function then the first argument is the unique error code, the second argument is an error string, and an optional third argument is a data structure that is relevant to the error.</p>
  </td>
  <td>
    <p><a href="examples#3012">showErrors console example</a></p>
    <p><a href="#">showErrors alert example</a></p>
    <p><a href="#">showErrors custom function example</a></p>
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
<p>You can define the list workflow using the <code class="js plain">children</code> property on List Objects.</p>
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
<tr id="list_object:ajaxEnabled">
  <td><code class="js plain">ajaxEnabled</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class="js keyword">false</code></td>
  <td>
    <p>If <code class="js keyword">true</code>, will send an AJAX request when the user types in the input.</p>
    <p>Note: You can have local list options as well as requesting results from a server. See this example.</p>
  </td>
  <td></td>
</tr>
<tr id="list_object:ajaxErrorHTML">
  <td><code class="js plain">ajaxErrorHTML</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><code class="js string">'AJAX Error!'</code></td>
  <td>
    <p>An HTML string to display when an AJAX request has failed.</p>
    <p>If <code class="js plain">ajaxErrorHTML</code> is a function, the first argument is the text that the user has entered and the second argument is the current value of the AutoComplete widget.</p>
    <p>The function should return an HTML string.</p>
  </td>
</tr>
<tr id="list_object:ajaxLoadingHTML">
  <td><code class="js plain">ajaxLoadingHTML</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><code class="js string">'Searching&amp;hellip;'</code></td>
  <td>
    <p>An HTML string to display when searching for options.</p>
    <p>If <code class="js plain">ajaxLoadingHTML</code> is a function, the first argument is the text that the user has entered and the second argument is the current value of the AutoComplete widget.</p>
    <p>The function should return an HTML string.</p>
  </td>
  <td>
    <p><a href="examples#4011">ajaxLoadingHTML string</a></p>
    <p><a href="examples#4037">ajaxLoadingHTML function</a></p>
  </td>
</tr>
<!--
<tr>
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">ajaxOptions</code></td>
  <td>Object of jQuery AJAX options</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>extend the jQuery AJAX options</p>
  </td>
</tr>
-->
<tr id="list_object:allowFreeform">
  <td><code class="js plain">allowFreeform</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class="js keyword">false</code></td>
  <td>
    <p>If <code class="js keyword">true</code>, allows the user to enter free-form text.</p>
    <p>If <code class="js keyword">false</code>, the user must select an option from the list.</p>
    <p>There can still be options when <code class="js plain">allowFreeform</code> is set to <code class="js keyword">true</code>, but the user does not have to select one.</p>
  </td>
  <td>
    <p><a href="#">allowFreeform Example</a></p>
  </td>
</tr>
<tr id="list_object:cacheAjax">
  <td><code class="js plain">cacheAjax</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class="js keyword">true</code></td>
  <td>
    <p>If <code class="js keyword">true</code>, AutoComplete will cache the results of AJAX calls to localStorage using the url as the key.</p>
    <p>If <code class="js keyword">false</code>, it will not cache and send a new AJAX request every time.</p>
    <p>If the browser does not support localStorage it will only cache results for the duration of the page.</p>
    <p>If you need to support browsers that do not have localStorage I recommend using a <a href="https://developer.mozilla.org/en-US/docs/DOM/Storage#localStorage">polyfill</a>.</p>
  </td>
  <td>
    <p><a href="#">cacheAjax Example</a></p>
  </td>
</tr>
<tr id="list_object:children">
  <td><code class="js plain">children</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>If specified, <code class="js plain">children</code> should be the name of a List Object.</p>
    <p>When any option from this list is selected from the dropdown, <code class="js plain">children</code> is the name of the next list to show up in the component.</p>
    <p>Note: If there is a <code class="js plain">children</code> property on the Option Object selected it will supersede this <code class="js plain">children</code> property.
       See the <code class="js plain">children</code> property in the <a href="docs#option_object">Option Object</a> reference.</p>
  </td>
  <td>
    <p><a href="#">children Example</a></p>
  </td>
</tr>
<tr id="list_object:highlightMatches">
  <td><code class="js plain">highlightMatches</code></td>
  <td>Boolean</td>
  <td>no</td>
  <td><code class="js keyword">true</code></td>
  <td>
    <p>If <code class="js keyword">true</code>, will highlight letter matches between what the user has typed and which options have matched.</p>
    <p>This option programmatically changes the <code class="js plain">optionHTML</code> value by adding <code class="js plain">&lt;strong&gt;</code> tags around matching characters.
       It tries to not replace letters that are inside HTML tags, but if you have complicated HTML markup in your <code class="js plain">optionHTML</code> it may break.</p>
  </td>
  <td>
    <p><a href="#">highlightMatches Example</a></p>
  </td>
</tr>
<tr id="list_object:matchOptions">
  <td><code class="js plain">matchOptions</code></td>
  <td>Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">matchOptions</code> is an optional function you can include to determine which options get shown in the dropdown when the user is typing.</p>
    <p>The first argument to the function is the text that the user has entered, the second argument is an array of Option Objects for the current list, and the third argument is the current value of the AutoComplete widget.</p>
    <p>The function should return an array of Option Objects.</p>
    <p>You can return an array of <em>any</em> Option Objects from this function.  They do not have to come from the existing Option Objects in the list.</p>
    <p>This function gets executed with every 'keydown' event on the input element so it's in your best interest to make this function as fast as possible.</p>
  </td>
  <td>
    <p><a href="#">matchOptions Example 1</a></p>
    <p><a href="#">matchOptions Example 2</a></p>
  </td>
</tr>
<tr id="list_object:matchProperties">
  <td>NOT IMPLEMENTED YET<br /><code class="js plain">matchProperties</code></td>
  <td>Array of option value properties</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">matchProperties</code> lets you pick which option value properties you want to match against as the user types.</p>
    <p>The order of the array will be the same order the options are matched against.</p>
    <p>If your option value is a string, <code class="js plain">matchProperties</code> will be ignored and the match function will try to match against the string.</p>
    <p><code class="js plain">matchProperties</code> gets ignored if you provide a custom <code class="js plain">matchOptions</code> function.</p>
  </td>
  <td>
    <p><a href="#">matchProperties Example 1</a></p>
    <p><a href="#">matchProperties Example 2</a></p>
  </td>
</tr>
<tr id="list_object:noResultsHTML">
  <td><code class="js plain">noResultsHTML</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><code class="js string">'No results found.'</code></td>
  <td>
    <p>An HTML string to display when there are no options to show.</p>
    <p>If <code class="js plain">noResultsHTML</code> is a function, the first argument is the text that the user has entered and the second argument is the current value of the AutoComplete widget.</p>
    <p>The function should return an HTML string.</p>
    <p>Note: <code class="js plain">noResultsHTML</code> will never be shown when <code class="js plain">allowFreeform</code> is <code class="js keyword">true</code>.</p>
  </td>
</tr>
<tr id="list_object:optionHTML">
  <td>FINISH DOCUMENTING ME<br /><code class="js plain">optionHTML</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>If <code class="js plain">optionHTML</code> is a string, strings inside curly braces will be replaced with HTML-escaped option values.</p>
    <p>If <code class="js plain">optionHTML</code> is a function the first argument is the option.</p>
    <p>The function should return an HTML string.</p>
    <p>If there is an <code class="js plain">optionHTML</code> property on the Option Object it will supersede this <code class="js plain">optionHTML</code> property.</p>
  </td>
  <td>
    <p><a href="example/list_optionhtml1">optionHTML Example</a></p>
  </td>
</tr>
<tr id="list_object:tokenHTML">
  <td>FINISH DOCUMENTING ME<br /><code class="js plain">tokenHTML</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">tokenHTML</code> is an optional function used to build the token HTML in the search bar for every option in the list.</p>
    <p>The first argument to the function is the option itself.</p>
    <p>The function should return an HTML string.</p>
    <p>Note: If there is a <code class="js plain">tokenHTML</code> property on the Option Object selected it will supersede this <code class="js plain">tokenHTML</code> property.
       See the <code class="js plain">tokenHTML</code> property in the <a href="docs#option_object">Option Object</a> reference.</p>
  </td>
</tr>
<tr id="list_object:preProcess">
  <td><code class="js plain">preProcess</code></td>
  <td>Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">preProcess</code> is an optional function you can use to process data that is returned from the server.</p>
    <p>The first argument is the data returned by the server and the second argument is the current value of the AutoComplete widget.</p>
    <p>The function should return an array of <a href="docs#option_object">Option Objects</a>.</p>
  </td>
  <td>
    <p><a href="examples#2003">AJAX with preProcess function</a></p>
  </td>
</tr>
<tr id="list_object:url">
  <td><code class="js plain">url</code></td>
  <td>String<br /><small>or</small><br />Function</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">url</code> is the URL to send an AJAX request to when <code class="js plain">ajaxEnabled</code> is <code class="js keyword">true</code>.</p>
    <p>The string <code class="js string">'{value}'</code> will be replaced with the text the user has typed.  The text will be escaped using <code class="js plain">encodeURIComponent()</code>.</p>
    <p>If <code class="js plain">url</code> is a function, the first argument is the text that the user has entered and the second argument is the current value of the AutoComplete widget.</p>
    <p>The function should return a url string.</p>
  </td>
</tr>
<tr id="list_object:options">
  <td><code class="js plain">options</code></td>
  <td>Array of Option Objects</td>
  <td>no</td>
  <td><code class="js plain">[]</code></td>
  <td>
    <p><code class="js plain">options</code> is an array of Option Objects.</p>
    <p>See the <a href="docs#option_object">Option Objects</a> reference for more information.</p>
  </td>
</tr>
</tbody>
</table>

<h2 id="option_object">Option Object</h2>
<div class="etymology">
  <div class="word">option</div>
  <div class="part-of-speech">Noun</div>
  <div class="definition">A thing that is or may be chosen.</div>
</div>
<p>Option Objects are the "meat" of the AutoComplete widget. They are the options displayed to the user as they type.</p>
<p>You can define the list workflow using the <code class="js plain">children</code> property on Option Objects.</p>
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
  <td><code class="js plain">children</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>If specified, <code class="js plain">children</code> should be the name of a List Object.</p>
    <p>When the option is selected from the dropdown, <code class="js plain">children</code> is the name of the next list to show.</p>
    <p>Note: This <code class="js plain">children</code> property will supersede a <code class="js plain">children</code> property on the parent List Object.</p>
  </td>
  <td>
    <p><a href="examples#1002">Multiple Lists</a></p>
    <p><a href="examples#1003">Nested Lists</a></p>
  </td>
</tr>
<tr id="option_object:group">
  <td><code class="js plain">group</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>You can group options into sections using the <code class="js plain">group</code> property.</p>
    <p>Options without groups get displayed first, followed by options with groups.</p>
    <p>You can control the sort order of groups with the <code class="js plain">groupSort</code> property on the parent List Object.</p>
  </td>
  <td>
    <p><a href="examples#1012">Grouped List</a></p>
  </td>
</tr>
<tr id="option_object:optionHTML">
  <td><code class="js plain">optionHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>An HTML string to show inside the dropdown.</p>
    <p>This <code class="js plain">optionHTML</code> property will supersede an <code class="js plain">optionHTML</code> function on the parent list.</p>
    <p>If there is no <code class="js plain">optionHTML</code> on the option and there is no <code class="js plain">optionHTML</code> on the parent list and <code class="js plain">value</code> is a string, then <code class="js plain">optionHTML</code> gets an HTML-escaped <code class="js plain">value</code>.</p>
  </td>
  <td></td>
</tr>
<tr id="option_object:tokenHTML">
  <td><code class="js plain">tokenHTML</code></td>
  <td>String</td>
  <td>no</td>
  <td><small>n/a</small></td>
  <td>
    <p>An HTML string to show inside the search bar.</p>
    <p>This <code class="js plain">tokenHTML</code> property will supersede a <code class="js plain">tokenHTML</code> property on the parent list.</p>
    <p>If there is no <code class="js plain">tokenHTML</code> on the option and there is no <code class="js plain">tokenHTML</code> on the parent <code class="js plain">tokenHTML</code> gets the value of <code class="js plain">optionHTML</code>.</p>
  </td>
  <td></td>
</tr>
<tr id="option_object:value">
  <td><code class="js plain">value</code></td>
  <td>String, Number, Array, or Object</td>
  <td>yes</td>
  <td><small>n/a</small></td>
  <td>
    <p><code class="js plain">value</code> is what gets saved when the user selects the option.</p>
    <p><code class="js plain">value</code> can be anything that is safe to call <code class="js plain">JSON.stringify()</code> on.</p>
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
<!--
<tr>
  <td><code class="js plain">config()</code></td>
  <td></td>
  <td>
    <p></p>
  </td>
  <td>
    <p><a href="#">config() Example</a></p>
  </td>
</tr>
<tr>
  <td><code class="js plain">setConfig(config)</code></td>
  <td>
    <p><code class="js plain">config</code> - config object</p>
  </td>
  <td>
    <p>Set an individual config property.</p>
    <p>Returns <code class="js keyword">true</code> if the property was updated.</p>
    <p>Returns <code class="js keyword">false</code> otherwise.</p>
  </td>
  <td>
    <p><a href="#">setValue Example</a></p>
  </td>
</tr>
-->
<!--
<tr>
  <td><code class="js plain">setConfig(property, value)</code></td>
  <td>
    <p><code class="js plain">property</code> - config property name</p>
    <p><code class="js plain">value</code> - config value</p>
  </td>
  <td>
    <p>Set an individual config property.</p>
    <p>Returns <code class="js keyword">true</code> if the property was updated.</p>
    <p>Returns <code class="js keyword">false</code> otherwise.</p>
  </td>
  <td>
    <p><a href="#">setValue Example</a></p>
  </td>
</tr>
-->
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