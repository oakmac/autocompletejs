<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <title>AutoComplete Widget</title>
    <meta name="viewport" content="width=device-width">

    <link rel="stylesheet" href="css/bootstrap-2.2.2.min.css" />
	<link rel="stylesheet" href="css/shCoreDefault.css" />
    <link type="text/css" rel="stylesheet/less" href="css/autocomplete.less" />
    <script src="css/less-1.3.0.min.js"></script>

	<style type="text/css">
	div.example {
		padding: 50px 0px;
		border-bottom: 2px solid #ccc;
	}
	div.example-widget {

	}
	</style>
</head>
<body>
<div id="body_wrapper" class="container">

<?php
$examples = getExamples();
foreach ($examples as $example) {
    echo '<!-- begin Example ' . $example['num'] . ' -->'."\n";
    echo '<div class="example">'."\n";
    echo buildExampleDescription($example['description']);
    echo '<pre class="brush:js;">'."\n";
    echo $example['js']."\n";
    echo '</pre>'."\n";
    echo '<div id="example' . $example['num'] . '" class="example-widget"></div>'."\n";
    echo '</div>'."\n";
    echo '<!-- end Example ' . $example['num'] . ' -->'."\n\n\n";
}
?>
<div style="height: 400px"></div>

</div><!-- end #body_wrapper -->

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/shCore.js"></script>
<script src="js/shBrushJScript.js"></script>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

<?php
foreach ($examples as $example) {
    //echo '//-------------------------------------------'."\n";
    echo '// Example ' . $example['num'] . "\n";
    //echo '//-------------------------------------------'."\n";
    echo '(function() {'."\n\n";
    echo $example['js']."\n\n";
    echo '})();'."\n\n\n";
}
?>
// end examples

// turn on syntax highlighter
SyntaxHighlighter.all();

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
    foreach ($jsFiles as $file) {
        $exampleNum = str_replace('examples/example', '', $file);
        $exampleNum = (int) str_replace('.js', '', $exampleNum);
        $jsFileContent = trim(file_get_contents($file));
        $textFileName = 'examples/example' . $exampleNum . '.txt';
        $textFileContent = trim(file_get_contents($textFileName));

        array_push($examples, array(
            'js' => $jsFileContent,
            'num' => $exampleNum,
            'description' => $textFileContent,
        ));
    }

    return $examples;
}

function buildExampleDescription($text) {
    $textArr = explode("\n", $text);
    $html = '';
    foreach ($textArr as $line) {
        if (trim($line) === '') continue;
        $html .= '<p>' . $line . '</p>'."\n";
    }
    return $html;
}

?>