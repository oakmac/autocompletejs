<?php
// this template receives:
// $example - example array

$page_title = 'Example';
include(APP_PATH.'pages/header.php');
?>

<div class="example">
<p><a href="examples">&larr; Back to all examples.</a></p>
<pre class="prettyprint lang-js linenums">
<?php echo htmlspecialchars($example['js']); ?>
</pre>
<?php echo $example['html'] . "\n"; ?>
</div><!-- end div.example -->

<script src="js/jquery-1.8.2.min.js"></script>
<script src="js/prettify.js"></script>
<script src="js/autocomplete.js"></script>
<script>
var init = function() {

// start example code
<?php echo $example['js'] . "\n"; ?>
// end example code

// syntax highlighting
prettyPrint();

}; // end init()
$(document).ready(init);
</script>

<?php
include(APP_PATH.'pages/footer.php');
?>