<?php

// should only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  header('HTTP/1.1 405 Method Not Allowed');
  echo 'Method not allowed.';
  die;
}

// check login credentials
if ($_POST['username'] !== 'admin' ||
    $_POST['password'] !== 'secret1') {
  header('HTTP/1.1 403 Forbidden');
  echo 'Forbidden';
  die;
}

$users = array('ajohnson', 'cstone', 'kantell', 'mbrown', 'qjames', 'wking');

$search = strtolower($_POST['q']);
if ($search === '') {
  echo json_encode($users);
  die;
}

$results = array();
foreach ($users as $user) {
  if (strpos($user, $search) !== false) {
    array_push($results, $user);
  }
}
echo json_encode($results);
die;
?>