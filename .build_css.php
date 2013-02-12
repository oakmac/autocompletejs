<?php
// this script must be run from the command line
if (defined('STDIN') !== true) die;

// include the LESS compiler
require('php/less.inc.php');
$less = new lessc;

$lessFiles = glob('css/*.less');
foreach ($lessFiles as $f) {
  // we can skip this file
  // temporary solution...
  if ($f === 'css/prettify.less') continue;

  echo 'compiling '.$f.'...';
  $cssFileName = str_replace('.less', '.css', $f);
  try {
    $less->compileFile($f, $cssFileName);
  }
  catch (exception $e) {
    echo "\n\n".'Failed to compile LESS file "'.$f.'". Do you have errors in your syntax? Exiting...'."\n\n";
    die;
  }

  echo 'done'."\n";
}

die;

?>