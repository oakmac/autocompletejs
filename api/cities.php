<?php
sleep(1);
$texasCitiesJSON = file_get_contents('texas_cities.json');
$texasCities = json_decode($texasCitiesJSON, true);

// only work for our demo
if ($_GET['state'] !== 'TX' || $_GET['includeCommon'] !== 'false') {
  echo '[]';
  die;
}

$search = strtolower($_GET['q']);
$searchLen = strlen($search);
$commonCities = array('Austin','Dallas','El Paso','Houston','San Antonio');

$texasCities2 = array();
foreach ($texasCities as $city) {
  // skip common cities
  if (in_array($city, $commonCities) === true) continue;
  
  // front-match
  if (substr(strtolower($city), 0, $searchLen) !== $search) continue;
  
  array_push($texasCities2, $city);
}

echo json_encode($texasCities2);
die;
?>