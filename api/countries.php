<?php
$countriesJSON = file_get_contents('countries.json');
$countries = json_decode($countriesJSON, true);

// return all countries if they have not entered a query
if (array_key_exists('q', $_GET) === false || $_GET['q'] === '') {
  echo json_encode(array('countries' => $countries));
	die;
}

$searchValue = strtolower($_GET['q']);
$results = array();
foreach ($countries as $key => $value) {
	if (strpos(strtolower($value), $searchValue) === 0) {
    $results[$key] = $value;
  }
}
echo json_encode(array('countries' => $results));
die;
?>