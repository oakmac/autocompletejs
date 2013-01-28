<?php defined('APP_PATH') or die('No direct script access.');

final class AC {

  // returns an array of all the examples
  public static function getExamples() {
    $examples = array();
    $jsFiles = glob(APP_PATH.'examples/*.js');
    $count = 1;
    foreach ($jsFiles as $jsFileName) {
      $jsFileContent = trim(file_get_contents($jsFileName));
      
      $tmp = array_pop(explode('/', $jsFileName));
      $slug = str_replace('.js', '', $tmp);
      
      // skip empty files
      if ($jsFileContent === '') continue;
      
      $htmlFileName = str_replace('.js', '.html', $jsFileName);
      $htmlFileContent = trim(file_get_contents($htmlFileName));
      
      array_push($examples, array(
        'html' => $htmlFileContent,
        'js'   => $jsFileContent,
        'slug' => $slug,
        'num'  => $count,
      ));
      
      $count++;
    }
    
    return $examples;
  }

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