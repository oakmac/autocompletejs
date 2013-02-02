<?php
$page_title = 'Examples';
include(APP_PATH . 'pages/header.php');
$examples = AC::getExamples();
?>

<div class="row">

<div class="three columns">
<div id="examples_list_container">
<?php echo buildExampleList($examples); ?>
</div><!-- end #examples_list -->
</div><!-- end .three.columns -->

<div class="nine columns">
  <h3 id="example_name"></h3>
	<p><a href="#" id="example_single_page_link" target="_blank">View example in new window.</a></p>
  <div id="example_html_container"></div>
</div>

</div><!-- end div.row -->

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/autocomplete.js"></script>
<script>
// yo dawg, i heard you like code...
var examples = {};
<?php
foreach ($examples as $example) {
		echo 'examples["'.$example['number'].'"] = {'."\n";
		echo '  group: '.json_encode($example['group']).",\n";
		echo '  html: '.json_encode($example['html']).",\n";
		echo '  name: '.json_encode($example['name']).",\n";
		echo '  js: function() {'."\n";
		echo $example['js']."\n";
		echo '  }'."\n";
		echo '};'."\n";
}
?>

var showExample = function(number) {
  $('div#examples_list_container li').removeClass('active');
	$('li#example_' + number).addClass('active');
		
	$('#example_name').html(examples[number].name);
	$('#example_single_page_link').attr('href', 'examples/' + number);
	$('#example_html_container').html(examples[number].html);
	examples[number].js();
};

var clickExample = function() {
  var number = parseInt($(this).attr('data-example-number'), 10);
	if (examples.hasOwnProperty(number) !== true)	return;
	window.location.hash = number;
	loadExampleFromHash();
};

var loadExampleFromHash = function() {
  var number = parseInt(window.location.hash.replace('#', ''), 10);
	if (number < 1000 || examples.hasOwnProperty(number) !== true) {
    number = 1000;
		window.location.hash = number;
	}
	showExample(number);
};

var init = function() {
  $('#examples_list_container').on('click', 'li', clickExample);
	loadExampleFromHash();
	
  // syntax highlighting
  //prettyPrint();
};
$(document).ready(init);
</script>
</body>
</html>

<?php
//-----------------------------------------
// Functions
//-----------------------------------------
function buildExampleList($examples) {
  $html = '';
	$currentGroup = false;
	foreach ($examples as $ex) {
		
		// temporary
		if ($ex['js'] === '') continue;
		
		if ($ex['group'] !== $currentGroup) {
				if ($currentGroup !== false) {
						$html .= '</ul>'."\n";
				}
				$currentGroup = $ex['group'];
				$html .= '<h3>'.$currentGroup.'</h3>'."\n";
				$html .= '<ul>'."\n";
		}
		$html .= '  <li data-example-number="'.$ex['number'].'" id="example_'.$ex['number'].'">'.$ex['name'].'</li>'."\n";
	}
  $html .= '</ul>'."\n";
	return $html;
}
?>