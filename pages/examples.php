<?php
$page_title = 'Examples';
include(APP_PATH . 'pages/header.php');

$examples = AC::getExamples();
foreach ($examples as $example) {
    echo '<!-- begin ' . $example['slug'] . ' -->'."\n";
		echo '<div class="example">'."\n";
		echo '<p><a href="example/'.$example['slug'].'">View example on single page.</a></p>'."\n";
    echo '<pre class="prettyprint lang-js linenums">'."\n";
    echo $example['js']."\n";
    echo '</pre>'."\n";
    echo $example['html']."\n";
    echo '</div>'."\n";
    echo '<!-- end ' . $example['slug'] . ' -->'."\n\n\n";
		echo '<hr />';
}
?>
<div style="height: 400px"></div>

</div><!-- end #body_wrapper -->

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

<?php
foreach ($examples as $example) {
		echo '// begin '.$example['slug']."\n";
    echo '(function() {'."\n\n";
    echo $example['js']."\n\n";
    echo '})();'."\n";
		echo '// end '.$example['slug']."\n\n\n\n";
}
?>
// end examples

// syntax highlighting
prettyPrint();

}; // end init()
$(document).ready(init);
</script>
<script>
var examples = [



];
</script>
</body>
</html>