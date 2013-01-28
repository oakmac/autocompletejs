<?php
// this template receives:
// $example - example array

$page_title = 'Example';
include(APP_PATH.'pages/header.php');
?>

<?php
echo $example['html'];
?>

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/shCore.js"></script>
<script src="js/shBrushJScript.js"></script>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

<?php
echo $example['js'];
?>

// turn on syntax highlighter
SyntaxHighlighter.all();

}; // end init()
$(document).ready(init);
</script>

<?php
include(APP_PATH.'pages/footer.php');
?>