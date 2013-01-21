// polyfills
if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

/*
var widget = new AutoComplete(options);
widget.val();   // get the current value
widget.focus(); // put focus on the bar
widget.clear(); // clear the input of the bar
widget.reload(opts); // reload with a new options object
*/



window.AutoComplete = window.AutoComplete || function(containerElId, opts) {



// initialization sanity checks
// TODO: make sure jQuery is defined
// TODO: make sure JSON is defined
// TODO: make sure element exists in the DOM
// TODO: make sure opts are formatted correctly



// expand values into the data structure we're expecting
// NOTE: recursive function
var expandValues = function(values) {
    for (var i = 0; i < values.length; i++) {
        // single string becomes both the name and the value
        if (typeof values[i] === 'string') {
            values[i] = {
                value: values[i]
            };
        }

        // TODO: skip value if it is not an object literal with a .value property

        // if value is a string and no name specified, then name gets value
        if (typeof values[i].value === 'string' &&
            (values[i].hasOwnProperty('name') === false || typeof values[i].name !== 'string') ) {
            values[i].name = values[i].value;
        }

        // group becomes false if it does not exist
        if (typeof values[i].group !== 'string') {
            values[i].group = false;
        }

		// add the index to the value object
		values[i].index = i;

        // convert children if they exist
        // NOTE: recursive
        if (values[i].hasOwnProperty('children') === true) {
            values[i].children = expandValues(values[i].children);
        }
    }

    return values;
};

// expand values
var VALUES = opts.values;
if (Array.isArray(opts) === true) {
    VALUES = opts;
}
VALUES = expandValues(VALUES);

// class prefix
var CLASS_PREFIX = 'autocomplete';
if (typeof opts.classPrefix === 'string' && opts.classPrefix !== '') {
    CLASS_PREFIX = opts.classPrefix;
}

// max number of items to show in the autocomplete list
var LIST_MAX_LENGTH = 10;
if (opts.listMax === false || (typeof opts.listMax === 'number' && opts.listMax >= 0)) {
    LIST_MAX_LENGTH = opts.listMax;
}

// get the container element
var containerEl = $(containerElId);

// this is a stateful variable that contains the current value of the widget
var WIDGET_VALUE = [];

// this is a stateful variable that contains the values for the current dropdown list
var CURRENT_VALUES = VALUES;

var CURRENT_CHUNK = 1;

// stateful variable
var INPUT_HAPPENING = false;


//--------------------------------------------------------------
// Util Functions
//--------------------------------------------------------------
// simple string replacement
var tmpl = function(str, obj) {
    for (var i in obj) {
        str = str.replace(new RegExp('{' + i + '}', 'g'), obj[i]);
    }
    return str;
};

// html escape
var encode = function(str) {
    return (str + '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

var inArray = function(needle, haystack) {
    for (var i = 0; i < haystack.length; i++) {
        if (needle === haystack[i]) {
            return true;
        }
    }
    return false;
};

var arrayUnique = function(arr) {
	var arr2 = [];
	for (var i = 0; i < arr.length; i++) {
		if (inArray(arr[i], arr2) === false) {
			arr2.push(arr[i]);
		}
	}
	return arr2;
};

// build the markup inside the container
var buildMarkup = function() {
    var html = '' +
    '<div class="' + CLASS_PREFIX + '_internal_container">' +
      '<div class="pieces_container"></div>' +
      '<input type="text" class="input_proxy" style="visibility:hidden" />' +
	  '<div class="clearfix"></div>' +
      '<ul class="autocomplete_list" style="display:none"></ul>' +
    '</div>';

    return html;
};

// build the markup inside the container
containerEl.html(buildMarkup());

// grab elements in memory
var inputProxyEl = containerEl.find('input.input_proxy');
var listEl = containerEl.find('ul.autocomplete_list');
var piecesEl = containerEl.find('div.pieces_container');

// move the autocomplete container directly underneath the input element
// and show it
var showAutocompleteEl = function() {
    // get position and height of input proxy element
    var pos = inputProxyEl.position();
    var height = parseInt(inputProxyEl.height(), 10);

    // put the autocomplete list direclty beneath the input proxy
    listEl.css({
        display: '',
        // TODO: work on the CSS here
        top: height + pos.top + 8,
        left: pos.left
    });
};

// returns a sorted array of groups from an array of values
var getGroups = function(values) {
	var groups = [];
	values.forEach(function(value) {
		if (value !== false) {
			groups.push(value);
		}
	});
	groups = arrayUnique(groups);
	return groups.sort();
};

var buildOption = function(name, valuesIndex, highlighted) {
    var html = '<li class="value';
    if (highlighted === true) {
        html += ' highlighted';
    }
    html += '" data-index="' + valuesIndex + '">' + encode(name) + '</li>';

    return html;
};

// build autocomplete options
// TODO: sort by groups
var buildValuesList = function(values, numResults) {
    var html = '';
    var current_group = '';
    for (var i = 0; i < values.length; i++) {
        // group <li>
        if (values[i].group && values[i].group !== current_group) {
            html += '<li class="group">' +
                encode(values[i].group) + '</li>';
            current_group = values[i].group;
        }

        if (i === 0) {
            html += buildOption(values[i].name, values[i].index, true);
        }
        else {
            html += buildOption(values[i].name, values[i].index);
        }
    }
    return html;
};

// open an input element and prep it for typing
var startAutocomplete = function() {
    // empty the input element
    // unhide it
    // put the focus on it
    inputProxyEl.val('').css('visibility', '').focus();

    // fill the autocomplete container with elements
    listEl.html(buildValuesList(CURRENT_VALUES));

    // show the autocomplete container
    showAutocompleteEl();

    INPUT_HAPPENING = true;
};

var endAutocomplete = function() {
    inputProxyEl.css('visibility', 'hidden').blur();
    listEl.css('display', 'none').html('');
    INPUT_HAPPENING = false;
};

// click on the container
var clickContainerElement = function(e) {
	// prevent any clicks inside the container from bubbling up to the html element
	e.stopPropagation();

	// start autocomplete
	// TODO: should we not start autocomplete if it's already open?
    startAutocomplete();
};

var buildPiece = function(piece) {
    var html = '<span class="piece">' +
    encode(piece.name) +
    '</span>';

    return html;
};

var buildPieces = function() {
    var html = '';
	var chunkNum = 0;
    for (var i = 0; i < WIDGET_VALUE.length; i++) {
		var piece = WIDGET_VALUE[i];

		// start a new chunk
		if (i === 0 || piece.chunk !== chunkNum) {
			html += '<div class="chunk">' +
            '<span class="remove-chunk">x</span>';
			chunkNum++;
		}

        html += buildPiece(piece);

		if (WIDGET_VALUE[i+1] && WIDGET_VALUE[i+1].chunk === chunkNum) {
			html += '<span class="child-indicator">:</span>';
		}

		if ((i+1) === WIDGET_VALUE.length || WIDGET_VALUE[i+1].chunk !== chunkNum) {
			html += '</div>'; // end .chunk
		}
    }
	//html += '<div class="clearfix"></div>';
    return html;
};

var addPiece = function(piece) {
	// add the piece to the widget value
	WIDGET_VALUE.push(piece);

	// update the display
	piecesEl.html(buildPieces());
};

// returns the highlighted piece
// false if there is no highlighted piece
var getHighlightedPiece = function() {
    // get the highlighted value
    var highlightedEl = listEl.find('li.highlighted');

	// nothing highlighted
    if (highlightedEl.length !== 1) {
		return false;
	}

    // get the index of the current selection
    var index = parseInt($(highlightedEl[0]).attr('data-index'), 10);

    // bail if we do not find the index in CURRENT_VALUES
    // NOTE: this should never happen
    if (! CURRENT_VALUES[index]) {
		return false;
	}

	return CURRENT_VALUES[index];
};

var addHighlightedValue = function() {
    // get the highlighted value
    var highlightedEl = listEl.find('li.highlighted');

    // do nothing if no entry is highlighted
    if (highlightedEl.length !== 1) return;

    // get the index of the current selection
    var index = parseInt($(highlightedEl[0]).attr('data-index'), 10);

    // bail if we do not find the index in CURRENT_VALUES
    // NOTE: this should never happen
    if (! CURRENT_VALUES[index]) return;

	// see if this piece has children
	var hasChildren = false;
	if (CURRENT_VALUES[index].children) {
		hasChildren = true;
	}

	// add the selection to the widget
	WIDGET_VALUE.push({
		name: CURRENT_VALUES[index].name,
		value: CURRENT_VALUES[index].value,
		chunk: CURRENT_CHUNK
	});

	// update the widget's display
	piecesEl.html(buildPieces());

    // end the input
    endAutocomplete();

    // if this piece has children, then open a new autocomplete with them
    if (CURRENT_VALUES[index].children) {
        CURRENT_VALUES = CURRENT_VALUES[index].children;
    }
    // else reset to the default values and start a new chunk
    else {
        CURRENT_VALUES = VALUES;
		CURRENT_CHUNK++;
    }

	// start a new autocomplete
	startAutocomplete();
};

var addPiece = function(piece) {
	// get the highlighted value
	var value = getHighlightedPiece();

	// no highlighted value and free-form input is allowed
    if (value === false && CURRENT_VALUES.allowFreeform === true) {
		value = {
			value: inputProxyEl.val()
		};
	}

	// exit if we have nothing to add
	if (value === false) return;

	// set the current chunk
	value.chunk = CURRENT_CHUNK;

	WIDGET_VALUE.push(value);

	// update the widget's display
	piecesEl.html(buildPieces());

    // end the input
    endAutocomplete();

    // if this piece has children, then open a new autocomplete with them
    if (CURRENT_VALUES[index].children) {
        CURRENT_VALUES = CURRENT_VALUES[index].children;
    }
    // else reset to the default values and start a new chunk
    else {
        CURRENT_VALUES = VALUES;
		CURRENT_CHUNK++;
    }

	// start a new autocomplete
	startAutocomplete();
};

// press the up arrow in the input proxy
var pressUpArrow = function() {
    // get the highlighted element
    var highlightedEl = listEl.find('li.highlighted');

    // no row highlighted, highlight the last list element
    if (highlightedEl.length === 0) {
        listEl.find('li.value').last().addClass('highlighted');
        return;
    }

    // remove the highlight from the current element
    highlightedEl.removeClass('highlighted');

    // highlight the previous .value sibling
    highlightedEl.prevAll('li.value').first().addClass('highlighted');
};

// press the down arrow in the input proxy
var pressDownArrow = function() {
    // get the highlighted element
    var highlightedEl = listEl.find('li.highlighted');

    // no row highlighted, highlight the first _value list element
    if (highlightedEl.length === 0) {
        listEl.find('li.value').first().addClass('highlighted');
        return;
    }

    // remove the highlight from the current element
    highlightedEl.removeClass('highlighted');

    // highlight the next _value sibling
    highlightedEl.nextAll('li.value').first().addClass('highlighted');
};

// press the escape key
var pressEscapeKey = function() {
    endAutocomplete();
};

// user clicks an autocomplete value with their mouse
var clickValue = function(e) {
	// remove highlighted from all values in the list
	listEl.find('li.value').removeClass('highlighted');

	// add it to the value clicked
	$(this).addClass('highlighted');

	// add the piece
	addHighlightedValue();
};

// keyup on the input elmeent
var keyupInputElement = function(e) {
	// do nothing if we have already hidden the input element
	if (INPUT_HAPPENING !== true) return;

	// do nothing if they have pressed a control character
	// TODO: break out these codes into a global array
	if (inArray(e.which, [9, 13, 40, 38, 27]) !== false) return;

	var filteredValues = filterValues(inputProxyEl.val(), CURRENT_VALUES);

	// fill the autocomplete container with elements
    listEl.html(buildValuesList(filteredValues));
};

var filterValues = function(str, values) {
	var results = [];

	str = str.toLowerCase();

	for (var i = 0; i < values.length; i++) {
		if (str === values[i].name.toLowerCase().substring(0, str.length)) {
			results.push(values[i]);
		}
	}

	return results;
};

var pressEnterOrTab = function() {
    addHighlightedValue();
};

// keydown on the input element
var keydownInputElement = function(e) {
    var keyCode = e.which;

    // enter or tab
    if (keyCode === 9 || keyCode === 13) {
        e.preventDefault();
		pressEnterOrTab();
        return;
    }

    // backspace on an empty field
    if (keyCode === 8 && inputProxyEl.val() === '') {
        console.log("backspace on empty field");
        return;
    }

    // down arrow
    if (keyCode === 40) {
        pressDownArrow();
        return;
    }

    // up arrow
    if (keyCode === 38) {
        pressUpArrow();
        return;
    }

    // escape
    if (keyCode === 27) {
        pressEscapeKey();
        return;
    }
};

// TODO this needs to be better; should run up the DOM from the e.target
//      and check to see if the element is within containerEl
//      right now this doesn't work with multiple widgets on the same page
var clickPage = function(e) {
	// hide the autocomplete
	endAutocomplete();
};

// event handlers
containerEl.on('click', clickContainerElement);
containerEl.on('keydown', 'input.input_proxy', keydownInputElement);
containerEl.on('keyup', 'input.input_proxy', keyupInputElement);
containerEl.on('click', 'li.value', clickValue);

// catch all clicks on the page
$('html').on('click', clickPage);

// end window.AutoComplete()
};