<?php

$arr = array('Apple','Banana','Orange');
$random = rand(0,3);

if ($random === 0) {
  sleep(20);
  echo json_encode($arr);
  die;
}

if ($random === 1) {
  echo ']{' . json_encode($arr);
}

echo json_encode($arr);
die;

?>