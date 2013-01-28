<?php defined('APP_PATH') or die('No direct script access.');

final class AC {

  // get the html and js file for an example
  // returns false if the example does not exist
  public static function getExample($name) {
    // be strict about filename for security
    $name = AC::escapeFileName($name);
    
    if (file_exists(APP_PATH.'examples/'.$name.'.html') !== true) {
      return false;
    }
    
    return array(
      'html' => file_get_contents(APP_PATH.'examples/'.$name.'.html'),
      'js' => file_get_contents(APP_PATH.'examples/'.$name.'.js'),
    );
  }
  
  // our example files should only contain [a-z0-1_]
  public static function escapeFileName($str) {
    return preg_replace('/[^a-z0-9_]/', '', $str);
  }

}

?>