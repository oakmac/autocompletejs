<?php
$page_title = 'Download';
$active_nav_tab = 'Download';
include(APP_PATH . 'pages/header.php');
?>

<div class="section">
<h1>Downloads</h1>
<a class="button large radius" href="releases/0.1.0/autocomplete-0.1.0.zip">Download Most Recent Version</a>
</div>

<div class="section release">
<h4>0.1.0</h4>
<ul>
  <li><a href="releases/0.1.0/autocomplete-0.1.0.zip">autocomplete-0.1.0.zip</a></li>
  <li><a href="releases/0.1.0/autocomplete-0.1.0.js">autocomplete-0.1.0.js</a></li>
  <li><a href="releases/0.1.0/autocomplete-0.1.0.min.js">autocomplete-0.1.0.min.js</a></li>
  <li><a href="releases/0.1.0/autocomplete-0.1.0.css">autocomplete-0.1.0.css</a></li>
  <li><a href="releases/0.1.0/autocomplete-0.1.0.min.css">autocomplete-0.1.0.min.css</a></li>
</ul>
</div>

<div class="section">
<h4>Development</h4>
<p><a href="https://github.com/oakmac/autocompletejs/">GitHub</a></p>
</div>

<?php
include(APP_PATH . 'pages/footer.php');
?>