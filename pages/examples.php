<?php
$page_title = 'Examples';
include(APP_PATH . 'pages/header.php');
?>

<?php
$examples = getExamples();
foreach ($examples as $example) {
    echo '<!-- begin Example ' . $example['num'] . ' -->'."\n";
		echo '<div class="example">'."\n";
    echo '<pre class="prettyprint lang-js linenums">'."\n";
    echo $example['js']."\n";
    echo '</pre>'."\n";
    echo $example['html']."\n";
    echo '</div>'."\n";
    echo '<!-- end Example ' . $example['num'] . ' -->'."\n\n\n";
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
    echo '//-------------------------------------------'."\n";
    echo '// Example ' . $example['num'] . "\n";
    echo '//-------------------------------------------'."\n";
    echo '(function() {'."\n\n";
    echo $example['js']."\n\n";
    echo '})();'."\n\n\n";
}
?>
// end examples

// syntax highlighting
prettyPrint();

}; // end init()
$(document).ready(init);
</script>
</body>
</html>

<?php
//-------------------------------------------------
// Functions
//-------------------------------------------------
function getExamples() {
    $examples = array();
    $jsFiles = glob('examples/*.js');
	$i = 1;
    foreach ($jsFiles as $file) {
        $jsFileContent = trim(file_get_contents($file));
		$htmlFileName = str_replace('.js', '.html', $file);
        $htmlFileContent = trim(file_get_contents($htmlFileName));

        array_push($examples, array(
            'html' => $htmlFileContent,
            'js'   => $jsFileContent,
            'num'  => $i,
        ));
		
		$i++;
    }

    return $examples;
}

?>