<?php
$page_title = 'Markup';
include(APP_PATH.'pages/header.php');
?>

<div class="row">
<div class="twelve columns">


<table id="markup_example_tbl">
<tr>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Apple</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Banana</span>
    </div>
    <div class="token-group selected">
      <span class="remove-token-group">x</span>
      <span class="token">Orange</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" style="width: 1px" />
  <div style="clear:both"></div>
  <ul class="dropdown" style="display:none"></ul>
</div>


</td>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Apple</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Banana</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Orange</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Banana</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Orange</span>
    </div>
    <div class="token-group selected">
      <span class="remove-token-group">x</span>
      <span class="token">Apple</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Kiwi</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" style="width: 1px" />
  <div style="clear:both"></div>
  <ul class="dropdown" style="display:none"></ul>
</div>


</td>
</tr>
<tr>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Apple</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Chicken</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Beef</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" value="ba" />
  <div style="clear:both"></div>
  <ul class="dropdown">
    <li class="group">Fruits</li>
    <li class="option">Apple</li>
    <li class="option highlighted">Banana</li>
    <li class="group">Meats</li>
    <li class="option">Beef</li>
    <li class="option">Chicken</li>
  </ul>
</div>


</td>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
     <div class="token-group">
        <span class="remove-token-group">x</span>
        <span class="token">Fruit</span><span class="child-indicator">:</span><span class="token">Apple</span>
     </div>
     <div class="token-group">
        <span class="remove-token-group">x</span>
        <span class="token">Meats</span><span class="child-indicator">:</span><span class="token">Chicken</span>
     </div>
  </div>
  <input type="text" class="autocomplete-input" value="vege" />
  <div style="clear:both"></div>
  <ul class="dropdown">
    <li class="option">Fruit<span class="children-indicator">&rarr;</span></li>
    <li class="option">Meats<span class="children-indicator">&rarr;</span></li>
    <li class="option highlighted">Vegetables<span class="children-indicator">&rarr;</span></li>
  </ul>
</div>


</td>
</tr>
<tr>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Banana</span>
    </div>
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Orange</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" value="baco" />
  <div style="clear:both"></div>
  <ul class="dropdown">
    <li class="no-results">No results found.</li>
  </ul>
</div>


</td>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Name</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" value="Marco" />
  <div style="clear:both"></div>
  <ul class="dropdown">
    <li class="option highlighted">Marco</li>
  </ul>
</div>


</td>
</tr>
<tr>
<td>


<div class="autocomplete_internal_container">
  <div class="tokens">
    <div class="token-group">
      <span class="remove-token-group">x</span>
      <span class="token">Texas</span>
    </div>
  </div>
  <input type="text" class="autocomplete-input" value="ala" />
  <div style="clear:both"></div>
  <ul class="dropdown">
    <li class="searching">Searching</li>
  </ul>
</div>


</td>
<td>



</td>
</tr>
</table>


</div>
</div>

<script src="js/jquery-1.8.2.min.js"></script>
<script>
// simulate positioning the dropdowns
$(document).ready(function() {

  $('div.autocomplete_internal_container').each(function() {
    var inputEl = $(this).find('input.autocomplete-input');
    var listEl = $(this).find('ul.dropdown');

		var pos = inputEl.position();
		var height = parseInt(inputEl.height(), 10);
    listEl.css({
      top: (height + pos.top),
      left: pos.left
    });
  });

});
</script>

<?php
include(APP_PATH.'pages/footer.php');
?>