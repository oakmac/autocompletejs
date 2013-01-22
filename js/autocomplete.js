// polyfills
if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// TODO: add forEach
//       or remove it completely from the code

/*
var widget = new AutoComplete(options);
widget.val();   // get the current value
widget.focus(); // put focus on the bar
widget.clear(); // clear the input of the bar
widget.reload(opts); // reload with a new options object
*/



window.AutoComplete = window.AutoComplete || function(containerElId, opts) {

var KEYS = {
    BACKSPACE: 8,
    DELETE: 46,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
    UP_ARROW: 38,
    TAB: 9
};

// initialization sanity checks
// TODO: make sure jQuery is defined
// TODO: make sure JSON is defined
// TODO: make sure element exists in the DOM
// TODO: make sure opts are formatted correctly
// TODO: use unique error codes for easy internet searching
// TODO: allow them to set the initial value of the widget
// TODO: show an error when a value.children is not a valid list option


// expand a single value object
var expandValue = function(value) {
    // string becomes both the name and the value
    if (typeof value === 'string') {
        value = {
            value: value
        };
    }

    // if value is a string and no name specified, then name gets value
    if (typeof value.value === 'string' &&
        (value.hasOwnProperty('name') === false || typeof value.name !== 'string')) {
        value.name = value.value;
    }

    if (typeof value.group !== 'string') {
        value.group = false;
    }

    return value;
};

// expand lists into the data structure we're expecting
var expandList = function(list) {
	if (Array.isArray(list) === true) {
		list = {
			values: list
		};
	}
	
	// set an empty array for values if they are not set
	if (Array.isArray(list.values) !== true) {
		list.values = [];
	}
	
	// default for allowFreeform is false
	if (list.allowFreeform !== true) {
		list.allowFreeform = false;
	}
	
	// expand values
	if (Array.isArray(list.values) === true) {
		for (var i = 0; i < list.values.length; i++) {
			list.values[i] = expandValue(list.values[i]);
		}
	}
	
	return list;
};

var expandOptions = function(options) {
	// expand if using array shorthand
	if (Array.isArray(options) === true) {
		options = {
			initialList: 'default',
			lists: {
				'default': options
			}
		};
	}
	
	// TODO: make options.lists mandatory and throw error if it's not there?
	
	// expand lists
	for (var i in options.lists) {
		if (options.lists.hasOwnProperty(i) !== true) continue;
		options.lists[i] = expandList(options.lists[i]);
	}
	
	return options;
};




// expand options
opts = expandOptions(opts);




// class prefix
var CLASS_PREFIX = 'autocomplete';
if (typeof opts.classPrefix === 'string' && opts.classPrefix !== '') {
    CLASS_PREFIX = opts.classPrefix;
}

// max number of items to show in the autocomplete list
//var LIST_MAX_LENGTH = 10;
//if (opts.listMax === false || (typeof opts.listMax === 'number' && opts.listMax >= 0)) {
//    LIST_MAX_LENGTH = opts.listMax;
//}

// get the container element
var containerEl = $(containerElId);

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
      '<div class="pieces_container" data-value="[]"></div>' +
      '<input type="text" class="input_proxy" style="visibility:hidden" />' +
	  '<div class="clearfix"></div>' +
      '<ul class="autocomplete_list" style="display:none"></ul>' +
    '</div>';

    return html;
};

// build the markup inside the container
containerEl.html(buildMarkup());

// grab elements in memory
var inputEl = containerEl.find('input.input_proxy');
var listEl = containerEl.find('ul.autocomplete_list');
var piecesEl = containerEl.find('div.pieces_container');

// move the autocomplete container directly underneath the input element
// and show it
var showAutocompleteEl = function() {
    // get position and height of input proxy element
    var pos = inputEl.position();
    var height = parseInt(inputEl.height(), 10);

    // put the autocomplete list direclty beneath the input proxy
    listEl.css({
        display: '',
        // TODO: work on the CSS here
        top: height + pos.top + 8,
        left: pos.left
    });
};

// returns the current value of the widget
var getValue = function() {
	return JSON.parse(piecesEl.attr('data-value'));
};

// set the current value of the widget
var setValue = function(value) {
	piecesEl.attr('data-value', JSON.stringify(value));
}

// returns a sorted array of groups from an array of values
var getGroups = function(values) {
	var groups = [];
	for (var i = 0; i < values.length; i++) {
		if (typeof values[i].group === 'string') {
			groups.push(values[i].group);
		}
	}
	groups = arrayUnique(groups);
	return groups.sort();
};

var buildOption = function(value) {
    var html = '<li class="value"' +
	' data-value="' + encode(JSON.stringify(value.value)) + '"' +
	' data-name="' + encode(value.name) + '"';
	
	if (value.children) {
		html += ' data-children="' + encode(value.children) + '"';
	}
	
	html += '>' + encode(value.name);
	
	if (value.children) {
		html += '<span class="children-indicator">&rarr;</span>';
	}
	
	html += '</li>';

    return html;
};

// build autocomplete options
// TODO: allow custom group sort
var buildValuesList = function(values) {
    var html = '';
	var groups = getGroups(values);
	var i;
	
	// build all options without groups first
	for (i = 0; i < values.length; i++) {
		if (values[i].group === false) {
			html += buildOption(values[i]);
		}
	}
	
	// build the groups
	for (i = 0; i < groups.length; i++) {
		html += '<li class="group">' +
			encode(groups[i]) + '</li>';
			
		for (var j = 0; j < values.length; j++) {
			if (groups[i] === values[j].group) {
				html += buildOption(values[j]);
			}
		}
	}

    return html;
};

// start autocomplete for a list
var startAutocomplete = function() {
	// get the current list
	var list = opts.lists[opts.initialList];
	var currentValue = getValue();
	if (currentValue.length > 0
		&& typeof currentValue[currentValue.length-1] === 'string') {
		
		list = opts.lists[ currentValue[currentValue.length-1] ];
	}
	
    // empty the input element
    // unhide it
    // put the focus on it
    inputEl.val('');
    inputEl.css({
        visibility: '',
        width: '100px'
    });
    inputEl.focus();

    // fill the autocomplete container with elements
    listEl.html(buildValuesList(list.values));
	
	// highlight the first element
	listEl.find('li.value').filter(':first').addClass('highlighted');

    // show the autocomplete container
    showAutocompleteEl();

    // remove highlight from any chunks
    clearChunkHighlight();

    // toggle state
    INPUT_HAPPENING = true;
};

var closeAutocomplete = function() {
    inputEl.css({
        visibility: 'hidden',
        width: '0px'
    });
    inputEl.blur();
    listEl.css('display', 'none').html('');
    INPUT_HAPPENING = false;
};

// click on the container
var clickContainerElement = function(e) {
	// prevent any clicks inside the container from bubbling up to the html element
	e.stopPropagation();

	// start autocomplete if it's not already happening
    if (INPUT_HAPPENING === false) {
        startAutocomplete();
    }
    // else just put the focus on the text input
    else {
        inputEl.focus();
    }
};

var buildPiece = function(piece) {
    var html = '<span class="piece">' +
    encode(piece.name) +
    '</span>';

    return html;
};

var buildPieces = function() {
	var value = getValue();
    var html = '';
	
	var chunkNum = 0;
    for (var i = 0; i < value.length; i++) {
		var piece = value[i];
		
		if (typeof piece === 'string') {
			html += '<span class="child-indicator">:</span>' +
			'</div>';
			continue;
		}

		// start a new chunk
		if (i === 0 || piece.chunk !== chunkNum) {
			chunkNum++;
			html += '<div class="chunk" data-chunknum="' + chunkNum + '">' +
            '<span class="remove-chunk">x</span>';
		}

        html += buildPiece(piece);

		if (value[i+1] && value[i+1].chunk === chunkNum) {
			html += '<span class="child-indicator">:</span>';
		}

		if ((i+1) === value.length || (value[i+1].chunk && value[i+1].chunk !== chunkNum)) {
			html += '</div>'; // end .chunk
		}
    }
    return html;
};

var addHighlightedValue = function() {
    // get the highlighted value
    var highlightedEl = listEl.find('li.highlighted');

    // do nothing if no entry is highlighted
    if (highlightedEl.length !== 1) return;
	
	// get values from the option
	var name = highlightedEl.attr('data-name');
	var value = JSON.parse(highlightedEl.attr('data-value'));
	
	// get the current widget value
	var currentValue = getValue();
	var newPiece = {
		name: name,
		value: value,
		chunk: 1
	};
	
	if (currentValue.length > 0
		&& typeof currentValue[currentValue.length-1] === 'string') {
		currentValue.pop();
		
		if (currentValue[currentValue.length-1]
			&& typeof currentValue[currentValue.length-1].chunk === 'number') {
			newPiece.chunk = currentValue[currentValue.length-1].chunk;
		}
	}
	else if (currentValue.length > 0
			 && typeof currentValue[currentValue.length-1] !== 'string'
			 && typeof currentValue[currentValue.length-1].chunk === 'number') {
		newPiece.chunk = currentValue[currentValue.length-1].chunk + 1;
	}
	
	// add the new piece
	currentValue.push(newPiece);
	
	// see if we're at the end of the chunk
	var children = highlightedEl.attr('data-children');
	if (typeof children === 'string' && children !== '') {
		currentValue.push(children);
	}
	
	// set the new value
	setValue(currentValue);
	
	// update the widget display
	piecesEl.html(buildPieces());
	
	// close autocomplete
	closeAutocomplete();
	
	// start autocomplete
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
    closeAutocomplete();
    clearChunkHighlight();
};

var clearChunkHighlight = function() {
    piecesEl.find('div.chunk').removeClass('selected');
};

var clickChunk = function(e) {
    // remove highlight from other chunks
    clearChunkHighlight();

    // highlight this chunk
    $(this).addClass('selected');

    // stop autocomplete
    closeAutocomplete();

    // stop propagation
    e.stopPropagation();
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
    // TODO: code smell? this seems fishy
    var cntrlChars = [KEYS.ENTER, KEYS.TAB, KEYS.ESCAPE, KEYS.UP_ARROW, KEYS.DOWN_ARROW];
	if (inArray(e.which, cntrlChars) !== false) return;

	var filteredValues = filterValues(inputEl.val(), CURRENT_LIST);

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

var highlightLastChunk = function() {
    var chunksEl = piecesEl.find('div.chunk');
    chunksEl.removeClass('selected');
    chunksEl.filter(':last').addClass('selected');
};

var backspaceEmptyField = function() {
    closeAutocomplete();
    if (isChunkHighlighted() === true) {
        removeHighlightedChunk();
    }
    else {
        highlightLastChunk();
    }
};

var pressEnterOrTab = function() {
    // TODO: check for freeForm here
    addHighlightedValue();
};

// returns true if a chunk is highlighted
// false otherwise
var isChunkHighlighted = function() {
    return (piecesEl.find('div.selected').length === 1);
};

var removeHighlightedChunk = function() {
    piecesEl.find('div.selected').remove();

    // TODO: reset the chunk numbers
};

// keydown anywhere on the page
var keydownWindow = function(e) {
    var keyCode = e.which;

    // backspace or delete with a highlighted chunk
    if ((keyCode === KEYS.BACKSPACE || keyCode === KEYS.DELETE)
        && isChunkHighlighted() === true) {
        e.preventDefault();
        removeHighlightedChunk();
        return;
    }

    // escape key
    if (keyCode === KEYS.ESCAPE && isChunkHighlighted() === true) {
        clearChunkHighlight();
        return;
    }
};

// keydown on the input element
var keydownInputElement = function(e) {
    var keyCode = e.which;

    // enter or tab
    if (keyCode === KEYS.ENTER || keyCode === KEYS.TAB) {
        e.preventDefault();
		pressEnterOrTab();
        return;
    }

    // backspace on an empty field
    if (keyCode === KEYS.BACKSPACE && inputEl.val() === '') {
        e.preventDefault();
        e.stopPropagation();
        backspaceEmptyField();
        return;
    }

    // down arrow
    if (keyCode === KEYS.DOWN_ARROW) {
        pressDownArrow();
        return;
    }

    // up arrow
    if (keyCode === KEYS.UP_ARROW) {
        pressUpArrow();
        return;
    }

    // escape
    if (keyCode === KEYS.ESCAPE) {
        pressEscapeKey();
        return;
    }
};

// TODO this needs to be better; should run up the DOM from the e.target
//      and check to see if the element is within containerEl
//      right now this doesn't work with multiple widgets on the same page
var clickPage = function(e) {
	// hide the autocomplete
	closeAutocomplete();
};

// event handlers
containerEl.on('click', clickContainerElement);
containerEl.on('keydown', 'input.input_proxy', keydownInputElement);
containerEl.on('keyup', 'input.input_proxy', keyupInputElement);
containerEl.on('click', 'li.value', clickValue);
containerEl.on('click', 'div.chunk', clickChunk);

// catch all clicks on the page
$('html').on('click', clickPage);

// catch global keydown
$(window).on('keydown', keydownWindow);

// end window.AutoComplete()
};