<?php
$animals = array('Beaver','Elephant','Lion','Horse','Whale');

if (array_key_exists('q', $_GET) !== true || $_GET['q'] === '') {
  echo json_encode($animals);
  die;
}

$search = strtolower($_GET['q']);
$results = array();
foreach ($animals as $a) {
  if (strpos(strtolower($a), $search) === 0) {
    array_push($results, $a);
  }
}
echo json_encode($results);
die;
?>