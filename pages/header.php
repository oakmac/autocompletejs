<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>AutoCompleteJS<?php if (isset($page_title)) echo ' &raquo; '.$page_title; ?></title>
  <base href="<?php echo BASE_URL; ?>" />
  <meta name="viewport" content="width=device-width">

  <link rel="stylesheet" href="css/foundation-3.2.5.min.css" />
  <link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Open+Sans:regular,semibold|Droid+Sans+Mono" />
<?php if (IN_PRODUCTION === true): ?>
  <link rel="stylesheet" href="css/site.css" />
  <link rel="stylesheet" href="css/autocomplete.css" />
<?php else: ?>
  <link type="text/css" rel="stylesheet/less" href="css/site.less" />
  <link type="text/css" rel="stylesheet/less" href="css/autocomplete.less" />
  <script src="css/less-1.3.0.min.js"></script>
<?php endif; ?>
</head>
<body>
<?php
echo AC::buildTopBar($active_nav_tab);
?>
<div class="row" id="body_container">
<div class="twelve columns">
