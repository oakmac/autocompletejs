<?php
$page_title = 'Documentation';
include(APP_PATH . 'pages/header.php');
?>
<h1>Docs</h1>

<!--
TODO: Methods documentation
-->

<h2 id="config_object">AutoComplete Config Object</h2>
<p>The Config Object initializes the AutoComplete widget.</p>
<table class="table table-striped syntaxhighlighter">
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
  <tr>
    <td><code class="js plain">errors</code></td>
    <td>Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">errors</code> is an optional function you can use to log AutoComplete errors to.</p>
      <p>Good options include <code class="js plain">console.log</code> and <code class="js plain">window.alert</code>.</p>
      <p>Read more about <a href="docs/errors">AutoComplete errors</a>.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">Example 1</a></p>
        <p><a href="example/maxtokengroups2">Example 2</a></p>
    </td>    
  </tr>  
  <tr>
    <td><code class="js plain">initialList</code></td>
    <td>String</td>
    <td>yes</td>
    <td><small>n/a</small></td>
    <td>
      <p>The <code class="js plain">initialList</code> property is the first list started when the user clicks on the AutoComplete widget.</p>
      <p>It's value should be the name of a <a href="docs#list_object">List Object</a>.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">Example 1</a></p>
        <p><a href="example/maxtokengroups2">Example 2</a></p>
    </td>    
  </tr>
  <tr>
    <td><code class="js plain">lists</code></td>
    <td>Object of List Objects</td>
    <td>yes</td>
    <td><small>n/a</small></td>
    <td>
      <p>The <code class="js plain">lists</code> property contains all of the lists used to power the dropdown options.</p>
      <p>See the <a href="docs#list_object">List Object</a> reference for more information on List Objects.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">Example 1</a></p>
        <p><a href="example/maxtokengroups2">Example 2</a></p>
    </td>    
  </tr>
  <tr>
    <td><code class="js plain">maxTokenGroups</code></td>
    <td>Number<br /><small>or</small><br /><code class="js keyword">false</code></td>
    <td>no</td>
    <td><code class="js keyword">false</code></td>
    <td>
      <p>The maximum number of token groups allowed in the search bar.</p>
      <p>Set <code class="js plain">maxTokenGroups</code> to <code class="js keyword">false</code> to allow unlimited token groups.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">maxtokengroups1</a></p>
        <p><a href="example/maxtokengroups2">maxtokengroups2</a></p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">clearBtnHTML</code></td>
    <td>String<br /><small>or</small><br /><code class="js keyword">false</code></td>
    <td>no</td>
    <td><code class="js string">'foo'</code></td>
    <td>
      <p>An HTML string to clear the contents of the search bar.</p>
      <p>Set <code class="js plain">clearBtnHTML</code> to <code class="js keyword">false</code> to not show a clear button.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">Example 1</a></p>
        <p><a href="example/maxtokengroups2">Example 2</a></p>
    </td>    
  </tr>
  <tr>
    <td><code class="js plain">removeTokenGroupHTML</code></td>
    <td>String<br /><small>or</small><br /><code class="js keyword">false</code></td>
    <td>no</td>
    <td><code class="js string">'foo'</code></td>
    <td>
      <p>An HTML string to clear the contents of the search bar.</p>
      <p>Set <code class="js plain">removeTokenGroupHTML</code> to <code class="js keyword">false</code> to not show a clear button.</p>
    </td>
    <td>
        <p><a href="example/maxtokengroups1">Example 1</a></p>
        <p><a href="example/maxtokengroups2">Example 2</a></p>
    </td>    
  </tr>
</tbody>
</table>

<h2 id="list_object">List Object</h2>
<div class="etymology">
  <div class="word">list</div>
  <div class="part-of-speech">Noun</div>
  <div class="definition">A number of connected items or names written or printed consecutively, typically one below the other.</div>
</div>
<p>List Objects are the heart and soul of the AutoComplete widget. They define the options available to the user when they are typing.</p>
<p>The options for a List Object can be sourced directly in the JavaScript or externally with AJAX.</p>
<p>You can define the list workflow using the <code class="js plain">children</code> property on List Objects.</p>
<table class="table table-striped syntaxhighlighter">
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
  <tr>
    <td><code class="js plain">ajaxEnabled</code></td>
    <td>Boolean</td>
    <td>no</td>
    <td><code class="js keyword">false</code></td>
    <td>
      <p>If <code class="js keyword">true</code>, will send an AJAX request when the user types in the input.</p>
      <p>Note: You can have local list options as well as requesting results from a server. See this example.</p>
    </td>
    <td>
      
    </td>
  </tr>
  <tr>
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
      
    </td>
  </tr>
  <tr>
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
      
    </td>
  </tr>
  <tr>
    <td><code class="js plain">filterOptions</code></td>
    <td>Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">filterOptions</code> is an optional function you can use to filter what options get shown in the dropdown.</p>
      <p>The first argument to the function is the current value of the AutoComplete widget, the second argument is an array of Option Objects for the current list, and the third function is the text the user has entered.</p>
      <p>The function should return an array of Option Objects.</p>
      <p>This function gets executed with every 'keydown' event on the input element so it's in your best interest to make this function as fast as possible.</p>
      <p>Note: You can return an array of any Option Objects from this function.  They do not have to come from the existing Option Objects in the list.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">maxOptions</code></td>
    <td>Number<br /><small>or</small><br /><code class="js keyword">false</code></td>
    <td>no</td>
    <td><code class="js keyword">false</code></td>
    <td>
      <p><code class="js plain">maxOptions</code> is the maximum number of options to display in a dropdown.</p>
      <p>If <code class="js plain">maxOptions</code> is a number it must be an integer greater than 1.</p>
      <p>Set <code class="js plain">maxOptions</code> to <code class="js keyword">false</code> to show all options available.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">noResultsHTML</code></td>
    <td>String<br /><small>or</small><br />Function</td>
    <td>no</td>
    <td><code class="js string">'No results found.'</code></td>
    <td>
      <p>An HTML string to display when there are no options to show.</p>
      <p>If <code class="js plain">noResultsHTML</code> is a function, the first argument is the current value of the AutoComplete widget and the second argument is the text that the user has entered.</p>
      <p>The function should return an HTML string.</p>
      <p>Note: <code class="js plain">noResultsHTML</code> will never be shown when <code class="js plain">allowFreeform</code> is <code class="js keyword">true</code>.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">optionHTML</code></td>
    <td>Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">optionHTML</code> is an optional function used to build the option HTML in the dropdown for every option in the list.</p>
      <p>The first argument to the function is the option itself.</p>
      <p>The function should return an HTML string.</p>
      <p>Note: If there is a <code class="js plain">optionHTML</code> property on the Option Object selected it will supersede this <code class="js plain">optionHTML</code> property.
         See the <code class="js plain">optionHTML</code> property in the <a href="docs#option_object">Option Object</a> reference.</p>
    </td>
    <td>
      <p><a href="example/list_optionhtml1">list_optionhtml1</a></p>
    </td>    
  </tr>
  <tr>
    <td><code class="js plain">tokenHTML</code></td>
    <td>Function</td>
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
  <tr>
    <td><code class="js plain">postProcess</code></td>
    <td>Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">postProcess</code> is an optional function you can use to process data that is returned from the server.</p>
      <p>The first argument is the data returned by the server.</p>
      <p>The function should return an array of <a href="docs#option_objects">Option Objects</a>.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">searchingHTML</code></td>
    <td>String<br /><small>or</small><br />Function</td>
    <td>no</td>
    <td><code class="js string">'Searching'</code></td>
    <td>
      <p>An HTML string to display when searching for options.</p>
      <p>If <code class="js plain">searchingHTML</code> is a function, the first argument is the current value of the AutoComplete widget and the second argument is the text that the user has entered.</p>
      <p>The function should return an HTML string.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">url</code></td>
    <td>String<br /><small>or</small><br />Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">url</code> is the URL to send an AJAX request to when <code class="js plain">ajaxEnabled</code> is <code class="js keyword">true</code>.</p>
      <p>The string <code class="js string">'{value}'</code> will be replaced with the text the user has typed.  The text will be escaped using <code class="js plain">encodeURIComponent()</code>.</p>
      <p>If <code class="js plain">url</code> is a function, the first argument is the current value of the AutoComplete widget and the second argument is the text that the user has entered.</p>
      <p>The function should return a url string.</p>
    </td>
  </tr>
  <tr>
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
<table class="table table-striped syntaxhighlighter">
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
  <tr>
    <td><code class="js plain">children</code></td>
    <td>String</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p>If specified, <code class="js plain">children</code> should be the name of a List Object.</p>
      <p>When the option is selected from the dropdown, <code class="js plain">children</code> is the name of the next list to show.</p>
      <p>Note: This <code class="js plain">children</code> property will supersede a <code class="js plain">children</code> property on the parent List Object.</p>
    </td>
  </tr>
    <tr>
    <td><code class="js plain">group</code></td>
    <td>String</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p>You can group options into sections using the <code class="js plain">group</code> property.</p>
      <p>Options without groups get displayed first, followed by options with groups.</p>
      <p>You can control the sort order of groups with the <code class="js plain">groupSort</code> property on the parent List Object.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">optionHTML</code></td>
    <td>String<br /><small>or</small><br />Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p>An HTML string to show inside the dropdown.</p>
      <p>If there is no <code class="js plain">optionHTML</code> property and <code class="js plain">value</code> is a string, then <code class="js plain">optionHTML</code> gets an HTML-escaped <code class="js plain">value</code>.</p>
      <p>If <code class="js plain">value</code> is not a string, you must include an <code class="js plain">optionHTML</code> property.</p>
      <p>If <code class="js plain">optionHTML</code> is a function, the first argument is the option itself.</p>
      <p>The function should return an HTML string.</p>
      <p>Note: This <code class="js plain">optionHTML</code> property will supersede an <code class="js plain">optionHTML</code> property on the parent List Object.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">tokenHTML</code></td>
    <td>String<br /><small>or</small><br />Function</td>
    <td>no</td>
    <td><small>n/a</small></td>
    <td>
      <p>An HTML string to show inside the search bar.</p>
      <p>If <code class="js plain">tokenHTML</code> is a function, the first argument is the option itself.</p>
      <p>The function should return an HTML string.</p>
      <p>If there is no <code class="js plain">tokenHTML</code> property it uses <code class="js plain">optionHTML</code>.</p>
      <p>Note: This <code class="js plain">tokenHTML</code> property will supersede a <code class="js plain">tokenHTML</code> property on the parent List Object.</p>
    </td>
  </tr>
  <tr>
    <td><code class="js plain">value</code></td>
    <td>String, Number, Array, or Object</td>
    <td>yes</td>
    <td><small>n/a</small></td>
    <td>
      <p><code class="js plain">value</code> is what gets saved when the user selects the option.</p>
      <p><code class="js plain">value</code> can be anything that is safe to call <code class="js plain">JSON.stringify()</code> on.</p>
    </td>
  </tr>
</tbody>
</table>

<?php
include(APP_PATH . 'pages/footer.php');
?>