<?php
$examples = glob('../examples/*.js');
foreach ($examples as $file) {
    exec('expand -i -t2 ' . $file . ' > tmp.js');
    exec('mv tmp.js ' . $file);
}
unlink('tmp.js');
?>