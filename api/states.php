<?php
$statesJSON = '[{"name":"Alabama","value":"AL"},{"name":"Alaska","value":"AK"},{"name":"Arizona ","value":"AZ"},{"name":"Arkansas","value":"AR"},{"name":"California ","value":"CA"},{"name":"Colorado ","value":"CO"},{"name":"Connecticut","value":"CT"},{"name":"Delaware","value":"DE"},{"name":"Florida","value":"FL"},{"name":"Georgia","value":"GA"},{"name":"Hawaii","value":"HI"},{"name":"Idaho","value":"ID"},{"name":"Illinois","value":"IL"},{"name":"Indiana","value":"IN"},{"name":"Iowa","value":"IA"},{"name":"Kansas","value":"KS"},{"name":"Kentucky","value":"KY"},{"name":"Louisiana","value":"LA"},{"name":"Maine","value":"ME"},{"name":"Maryland","value":"MD"},{"name":"Massachusetts","value":"MA"},{"name":"Michigan","value":"MI"},{"name":"Minnesota","value":"MN"},{"name":"Mississippi","value":"MS"},{"name":"Missouri","value":"MO"},{"name":"Montana","value":"MT"},{"name":"Nebraska","value":"NE"},{"name":"Nevada","value":"NV"},{"name":"New Hampshire","value":"NH"},{"name":"New Jersey","value":"NJ"},{"name":"New Mexico","value":"NM"},{"name":"New York","value":"NY"},{"name":"North Carolina","value":"NC"},{"name":"North Dakota","value":"ND"},{"name":"Ohio","value":"OH"},{"name":"Oklahoma","value":"OK"},{"name":"Oregon","value":"OR"},{"name":"Pennsylvania","value":"PA"},{"name":"Rhode Island","value":"RI"},{"name":"South Carolina","value":"SC"},{"name":"South Dakota","value":"SD"},{"name":"Tennessee","value":"TN"},{"name":"Texas","value":"TX"},{"name":"Utah","value":"UT"},{"name":"Vermont","value":"VT"},{"name":"Virginia ","value":"VA"},{"name":"Washington","value":"WA"},{"name":"West Virginia","value":"WV"},{"name":"Wisconsin","value":"WI"},{"name":"Wyoming","value":"WY"}]';

if (array_key_exists('q', $_GET) === false || $_GET['q'] === '') {
	echo $statesJSON;
	die;
}

$states = json_decode($statesJSON, true);
$searchValue = strtolower($_GET['q']);
$results = array();
foreach ($states as $state) {
	if (strpos(strtolower($state['name']), $searchValue) === 0) {
		array_push($results, $state);
	}
}
echo json_encode($results);
die;
?>