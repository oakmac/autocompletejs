<?php defined('APP_PATH') or die('No direct script access.');

final class AC {

  // returns an array of all the examples
  public static function getExamples() {
    $examples = self::getExamplesJSON();
    for ($i = 0; $i < count($examples); $i++) {
      $num = $examples[$i]['number'];
      $examples[$i]['html'] = trim(file_get_contents(APP_PATH.'examples/'.$num.'.html'));
      $examples[$i]['js']   = trim(file_get_contents(APP_PATH.'examples/'.$num.'.js'));
    }
    return $examples;
  }

  // get the html and js file for an example
  // returns false if the example does not exist
  public static function getExample($number) {
    // example should be an integer
    $number = (int) $number;
    
    if (file_exists(APP_PATH.'examples/'.$number.'.html') !== true) {
      return false;
    }
    
    return array(
      'html'   => file_get_contents(APP_PATH.'examples/'.$number.'.html'),
      'js'     => file_get_contents(APP_PATH.'examples/'.$number.'.js'),
      'number' => $number,
    );
  }
  
  //---------------------------------------------------
  // Private Functions
  //---------------------------------------------------
  private static function getExamplesJSON() {
    $examples = json_decode(file_get_contents(APP_PATH.'examples/examples.json'), true);
    $examples2 = array();
    foreach ($examples as $e) {
      if (is_array($e) !== true) continue;
      array_push($examples2, $e);
    }
    return $examples2;
  }
  
}

?>