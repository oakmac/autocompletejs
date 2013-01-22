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

//--------------------------------------------------------------
// Module scope variables
//--------------------------------------------------------------

var KEYS = {
    BACKSPACE: 8,
    DELETE: 46,
    DOWN_ARROW: 40,
    ENTER: 13,
    ESCAPE: 27,
    UP_ARROW: 38,
    TAB: 9
};

// hold DOM elements
var containerEl, piecesEl, inputEl, listEl;

// stateful
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
    var entities = [
        [/&/g, '&amp;'],
        [/</g, '&lt;'],
        [/>/g, '&gt;'],
        [/"/g, '&quot;'],
        [/'/g, '&#39;'],
        [/\//g, '&#x2F']
    ];
    str = str + '';
    for (var i = 0; i < entities.length; i++) {
        str = str.replace(entities[i][0], entities[i][1]);
    }
    return str;
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

//--------------------------------------------------------------
// Sanity Checks
//--------------------------------------------------------------

var showError = function(code, msg) {
    window.alert('AutoComplete Error ' + code + ': ' + msg);
};

// NOTE: all of the errors have unique codes so that people who search
//       for them can find them easily :)
var sanityChecks = function() {
    // container ID must be a string
    if (typeof containerElId !== 'string' || containerElId === '') {
        showError(1001, 'Container element id must be a non-empty string');
        return false;
    }

    // make sure the container element exists in the DOM
    if (! document.getElementById(containerElId)) {
        showError(1002, 'Element with id "' + containerElId + '" does not exist in DOM.');
        return false;
    }

    // TODO: make sure jQuery is defined
    // TODO: make sure JSON is defined
    // TODO: make sure opts are formatted correctly
    // TODO: allow them to set the initial value of the widget
    // TODO: show an error when a value.children is not a valid list option

    return true;
};

//--------------------------------------------------------------
// Expand Input / Set Default Options
//--------------------------------------------------------------

// expand a single value object
var expandValue = function(value) {
    // string becomes the value
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

	// group is either true or false
    if (typeof value.group !== 'string') {
        value.group = false;
    }

    return value;
};

var expandList = function(list) {
	// an array is the values
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
	for (var i = 0; i < list.values.length; i++) {
		list.values[i] = expandValue(list.values[i]);
	}

	return list;
};

var initOptions = function() {
	// an array is a single list option
	if (Array.isArray(opts) === true) {
		opts = {
			initialList: 'default',
			lists: {
				'default': opts
			}
		};
	}

	// TODO: make options.lists mandatory and throw error if it's not there?

    // class prefix
    if (typeof opts.classPrefix !== 'string' || opts.classPrefix === '') {
        opts.classPrefix = 'autocomplete';
    }

	// expand lists
	for (var i in opts.lists) {
		if (opts.lists.hasOwnProperty(i) !== true) continue;
		opts.lists[i] = expandList(opts.lists[i]);
	}
};

//--------------------------------------------------------------
// Markup Building Functions
//--------------------------------------------------------------

// build the markup inside the container
var buildWidget = function() {
    var html = '' +
    '<div class="' + opts.classPrefix + '_internal_container">' +
      '<div class="pieces_container" data-value="[]"></div>' +
      '<input type="text" class="input_proxy" style="visibility:hidden" />' +
	  '<div class="clearfix"></div>' +
      '<ul class="dropdown" style="display:none"></ul>' +
    '</div>';

    return html;
};

var buildValue = function(value) {
    var html = '<li';
    if (value.hasOwnProperty('clickable') === false || value.clickable !== false) {
        html += ' class="value"';
    }
	html += ' data-value="' + encode(JSON.stringify(value.value)) + '"' +
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

// build dropdown options
// TODO: allow custom group sort
var buildDropdown = function(values) {
    var html = '';
	var groups = getGroups(values);
	var i;

	// build all options without groups first
	for (i = 0; i < values.length; i++) {
		if (! values[i].group) {
			html += buildValue(values[i]);
		}
	}

	// build the groups
	for (i = 0; i < groups.length; i++) {
		html += '<li class="group">' +
			encode(groups[i]) + '</li>';

		for (var j = 0; j < values.length; j++) {
			if (groups[i] === values[j].group) {
				html += buildValue(values[j]);
			}
		}
	}

    return html;
};

var buildPiece = function(piece) {
    var html = '<span class="piece">' +
    encode(piece.name) +
    '</span>';

    return html;
};

// TODO: re-write this
var buildPieces = function() {
	var value = getValue();
    var html = '';

	var chunkNum = 0;
    for (var i = 0; i < value.length; i++) {
		var piece = value[i];

		if (typeof piece === 'string') {
			html += '<span class="child-indicator">:</span>' +
			'</div>'; // end div.chunk
			continue;
		}

		// start a new chunk
		if (i === 0 || piece.chunk !== chunkNum) {
			chunkNum++;
			html += '<div class="chunk" data-chunk="' + chunkNum + '">' +
            '<span class="remove-chunk">&times;</span>';
		}

        html += buildPiece(piece);

		if (value[i+1] && value[i+1].chunk === chunkNum) {
			html += '<span class="child-indicator">:</span>';
		}

		if ((i+1) === value.length || (value[i+1].chunk && value[i+1].chunk !== chunkNum)) {
			html += '</div>'; // end div.chunk
		}
    }
    return html;
};

//--------------------------------------------------------------
// Control Flow / DOM Manipulation
//--------------------------------------------------------------

var showDropdown = function() {
    // get position and height of input element
    var pos = inputEl.position();
    var height = parseInt(inputEl.height(), 10);

    // put the dropdown directly beneath the input element
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

var listExists = function(list) {
    if (opts.lists[list]) {
        return true;
    }
    return false;
};

var startInput = function() {
	// get the current list
	var list = opts.lists[opts.initialList];
	var currentValue = getValue();
	if (currentValue.length > 0
		&& typeof currentValue[currentValue.length-1] === 'string') {

        if (listExists(currentValue[currentValue.length-1]) === true) {
            list = opts.lists[ currentValue[currentValue.length-1] ];
        }
	}

    // empty the input element, unhide it, put the focus on it
    inputEl.val('');
    inputEl.css({
        visibility: '',
        width: '100px'
    });
    inputEl.focus();

    // open the dropdown with all the values
    updateDropdown(list.values);

    // show the dropdown
    showDropdown();

    // remove highlight from any chunks
    clearChunkHighlight();

    // toggle state
    INPUT_HAPPENING = true;
};

var updateDropdown = function(values) {
    // fill the dropdown with values
    listEl.html(buildDropdown(values));

	// highlight the first element
	listEl.find('li.value').filter(':first').addClass('highlighted');
};

var stopInput = function() {
    // hide the input element and make it small so it doesn't wrap
    inputEl.css({
        visibility: 'hidden',
        width: '0px'
    });
    inputEl.blur(); // NOTE: I don't think this line is necessary?

    // hide the dropdown list
    listEl.css('display', 'none').html('');

    // toggle state
    INPUT_HAPPENING = false;
};

var clearChunkHighlight = function() {
    piecesEl.find('div.chunk').removeClass('selected');
};

var highlightLastChunk = function() {
    var chunksEl = piecesEl.find('div.chunk');
    chunksEl.removeClass('selected');
    chunksEl.filter(':last').addClass('selected');
};

// returns true if a chunk is highlighted
// false otherwise
var isChunkHighlighted = function() {
    return (piecesEl.find('div.selected').length === 1);
};

// TODO: I really don't like this kind of code
//       need to improve the value data structure
var removeChunk = function(chunk) {
    var value = getValue();

    var lastIndex = value.length - 1;
    if (typeof value[lastIndex] === 'string'
        && value[lastIndex-1] && value[lastIndex-1].chunk === chunk) {
        value.pop();
    }

    var value2 = [];
    for (var i = 0; i < value.length; i++) {
        if (value[i].chunk !== chunk) {
            value2.push(value[i]);
        }
    }

    setValue(value2);
};

var removeHighlightedChunk = function() {
    var highlightedEl = piecesEl.find('div.selected');
    var chunk = parseInt(highlightedEl.attr('data-chunk'), 10);

    removeChunk(chunk);
    updatePieces();
};

var addPieceToValue = function(value, piece) {
	// TODO: write me
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

	// add to existing chunk
	var lastIndex = currentValue.length - 1;
	if (currentValue[lastIndex] && typeof currentValue[lastIndex] === 'string') {
		currentValue[lastIndex] = newPiece;

		if (currentValue[lastIndex-1]) {
			currentValue[lastIndex].chunk = currentValue[lastIndex-1].chunk;
		}
	}
	// start a new chunk
	else {
		currentValue.push(newPiece);

		if (currentValue[currentValue.length-2]) {
			currentValue[currentValue.length-1].chunk = currentValue[currentValue.length-2].chunk + 1;
		}
	}

	// add the next child to the end of the chunk
	var children = highlightedEl.attr('data-children');
	if (typeof children === 'string' && children !== '') {
		currentValue.push(children);
	}

	// set the new value
	setValue(currentValue);

	// update the widget display
	updatePieces();

	// close current input
	stopInput();

	// start new input
	startInput();
};

var updatePieces = function() {
    piecesEl.html(buildPieces());
};

var filterValues = function(str, values) {
	str = str.toLowerCase();
    var results = [];
	for (var i = 0; i < values.length; i++) {
		if (str === values[i].name.toLowerCase().substring(0, str.length)) {
			results.push(values[i]);
		}
	}
	return results;
};

var getCurrentList = function() {
    var value = getValue();
    var lastIndex = value.length - 1;
    if (typeof value[lastIndex] === 'string'
        && listExists(value[lastIndex]) === true) {
        return opts.lists[value[lastIndex]];
    }

    return opts.lists[opts.initialList];
};

var handleTextInput = function() {
    var list = getCurrentList();
    var value = inputEl.val();
	var filteredValues = filterValues(value, list.values);

    if (filteredValues.length === 0) {
        if (list.allowFreeform === true) {
            filteredValues.push({
                name: value,
                value: value
            });
        }
        else {
            filteredValues.push({
                clickable: false,
                name: 'No results found.',
                value: false
            });
        }
    }

	// fill the dropdown with the filtered results
    updateDropdown(filteredValues);
};

//--------------------------------------------------------------
// Input Keypresses
//--------------------------------------------------------------

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

var pressEscapeKey = function() {
    stopInput();
    clearChunkHighlight();
};

var pressBackspaceOnEmptyInput = function() {
    stopInput();
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

//--------------------------------------------------------------
// Browser Events
//--------------------------------------------------------------

// click on the container
var clickContainerElement = function(e) {
	// prevent any clicks inside the container from bubbling up to the html element
	e.stopPropagation();

	// start input if it's not already happening
    if (INPUT_HAPPENING === false) {
        startInput();
    }
    // else just put the focus on the input element
    else {
        inputEl.focus();
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
        pressBackspaceOnEmptyInput();
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

// keyup on the input elmeent
var keyupInputElement = function(e) {
	// do nothing if we have already hidden the input element
    // NOTE: I think this should never happen
	if (INPUT_HAPPENING !== true) return;

	// do nothing if they have pressed a control character
    // TODO: code smell? this seems fishy
    var cntrlChars = [KEYS.ENTER, KEYS.TAB, KEYS.ESCAPE, KEYS.UP_ARROW, KEYS.DOWN_ARROW];
	if (inArray(e.which, cntrlChars) !== false) return;

    handleTextInput();
};

// user clicks a dropdown value
var clickValue = function(e) {
	// remove highlighted from all values in the list
	listEl.find('li.value').removeClass('highlighted');

	// add highlight class to the value clicked
	$(this).addClass('highlighted');

	// add the piece
	addHighlightedValue();
};

// user clicks a chunk
var clickChunk = function(e) {
    // remove highlight from other chunks
    clearChunkHighlight();

    // highlight this chunk
    $(this).addClass('selected');

    // stop input
    // NOTE: is this necessary?
    stopInput();

    // stop propagation
    e.stopPropagation();
};

// TODO this needs to be better; should run up the DOM from the e.target
//      and check to see if the element is within containerEl
//      right now this doesn't work with multiple widgets on the same page
var clickPage = function(e) {
	// stop input
	stopInput();
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

var addEvents = function() {
    containerEl.on('click', clickContainerElement);
    containerEl.on('keydown', 'input.input_proxy', keydownInputElement);
    containerEl.on('keyup', 'input.input_proxy', keyupInputElement);
    containerEl.on('click', 'li.value', clickValue);
    containerEl.on('click', 'div.chunk', clickChunk);

    // catch all clicks on the page
    $('html').on('click', clickPage);

    // catch global keydown
    $(window).on('keydown', keydownWindow);
};

//--------------------------------------------------------------
// Initialization
//--------------------------------------------------------------

var initDom = function() {
    // get the container element
    containerEl = $('#' + containerElId);

    // build the markup inside the container
    containerEl.html(buildWidget());

    // grab elements in memory
    inputEl = containerEl.find('input.input_proxy');
    listEl = containerEl.find('ul.dropdown');
    piecesEl = containerEl.find('div.pieces_container');
};

var init = function() {
    if (sanityChecks() !== true) return;
    initOptions();
    initDom();
    addEvents();
};
init();

// end window.AutoComplete()
};