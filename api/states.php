<?php

if ($_GET['slow'] === 'true') {
	sleep(1);
}

$statesJSON = file_get_contents('us_states.json');
$states = json_decode($statesJSON, true);

// we just want the names for this demo
$states2 = array();
foreach ($states as $st) {
	array_push($states2, $st['name']);
}
$states = $states2;

// return all states if they have not entered a query
if (array_key_exists('q', $_GET) === false || $_GET['q'] === '') {
	echo json_encode($states);
	die;
}

$searchValue = strtolower($_GET['q']);
$results = array();
foreach ($states as $st) {
	if (strpos(strtolower($st), $searchValue) === 0) {
		array_push($results, $st);
	}
}
echo json_encode($results);
die;
?>