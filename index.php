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
</style>
</head>
<body>
<div id="body_wrapper" class="container">

<?php
$examples = getExamples();
foreach ($examples as $example) {
    echo '<!-- begin Example ' . $example['num'] . ' -->'."\n";
    echo '<div class="example">'."\n";
    echo $example['html']."\n";
    echo '<pre class="brush:js; toolbar:false;">'."\n";
    echo $example['js']."\n";
    echo '</pre>'."\n";
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
    echo '//-------------------------------------------'."\n";
    echo '// Example ' . $example['num'] . "\n";
    echo '//-------------------------------------------'."\n";
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