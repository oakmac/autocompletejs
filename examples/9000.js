var onDateChangeEventAdded = false;

var startDate = function() {
  // hide the dropdown list
  $('div#search_bar ul.dropdown').css("visibility", "hidden");

  // start the date picker
  var inputEl = $('div#search_bar input.autocomplete-input');
  inputEl.datepicker();

  // we only want to add this event once
  // there's a bug with datepicker where ('remove') doesn't remove
  // the onChange event
  if (onDateChangeEventAdded === false) {
    inputEl.on('changeDate', function() {
      // put the focus on the widget and press enter
      widget.focus(widget.pressEnter);
    });
    onDateChangeEventAdded = true;
  }
};

var endDate = function() {
  // show the dropdown list
  $('div#search_bar ul.dropdown').css("visibility", "");

  // kill the date picker
  $('div#search_bar input.autocomplete-input').datepicker('remove');
};

var config = {
  initialList: 'dates',
  lists: {
    dates: [
      { value: 'My Birthday', children: 'date' },
      { value: 'His Birthday', children: 'date' },
      { value: 'Your Birthday', children: 'date' }
    ],
    date: {
      allowFreeform: true,
      onStart: startDate,
      onEnd: endDate,
      options: []
    }
  }
};
var widget = new AutoComplete('search_bar', config);