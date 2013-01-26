// polyfills
if(!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// TODO: custom value search and example
// TODO: custom AJAX example using POST or localStorage
// TODO: AJAX postprocessing example
// TODO: example using localStorage
// TODO: showChunkRemove true / false (default is true)
// TODO: need more control over how the chunks work
// TODO: "Much love to my PROS co-workers for inspiration, suggestions, and guinea-pigging."
// TODO: expose the htmlEncode and tmpl functions on the AutoComplete object so people can use them
//       in their buildHTML functions
// TODO: filterOptions should take a callback in the args

window['AutoComplete'] = window['AutoComplete'] || function(containerElId, cfg) {
'use strict';

//--------------------------------------------------------------
// Module scope variables
//--------------------------------------------------------------

// constants
var HTML_ENTITIES = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
  [/\//g, '&#x2F']
];

/*
var KEYS = {
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  LEFT: 37,
  RIGHT: 39,
  COMMA: 188
};
*/

var KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  UP: 38,
  DOWN: 40,
  DELETE: 46,
  NUMPAD_ENTER: 108
};

// DOM elements
var containerEl, piecesEl, inputEl, listEl;

// stateful
var ADD_NEXT_PIECE_TO_NEW_CHUNK = true;
var CHUNKS = [];
var CURRENT_LIST = false;
var INPUT_HAPPENING = false;
var VISIBLE_OPTIONS = {};

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
    str = str + '';
    for (var i = 0; i < HTML_ENTITIES.length; i++) {
        str = str.replace(HTML_ENTITIES[i][0], HTML_ENTITIES[i][1]);
    }
    return str;
};

var objectKeysToArray = function(obj) {
	var arr = [];
	for (var i in obj) {
		if (obj.hasOwnProperty(i) === true) {
			arr.push(i);
		}
	}
	return arr;
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//--------------------------------------------------------------
// Sanity Checks
//--------------------------------------------------------------

var validChunkIndex = function(chunkIndex) {
    if (typeof chunkIndex !== 'number') {
        return false;
    }

    chunkIndex = parseInt(chunkIndex, 10);
	if (chunkIndex < 0 || chunkIndex >= CHUNKS.length) {
		return false;
	}

    return true;
};

var validValueArray = function(value) {
    // value must be an array
    if (Array.isArray(value) !== true) {
        return false;
    }


    // TODO: should let them pass in strings as shorthand
    // value = [['Apple']];


    return true;
};

var validOptionObject = function(obj) {

    // TODO: write me

    return true;
};

var validListObject = function(obj) {

    // TODO: write me

    return true;
};

var showError = function(code, msg) {
    window.alert('AutoComplete Error ' + code + ': ' + msg);
};

var checkDeps = function() {


    // TODO: make sure jQuery is defined
    // TODO: make sure JSON is defined

    return true;
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


    // TODO: make sure cfg are formatted correctly
    // TODO: allow them to set the initial value of the widget (chunks object)
    // TODO: show an error when a value.children is not a valid list option

    return true;
};

//--------------------------------------------------------------
// Expand Shorthand / Set Default Options
//--------------------------------------------------------------

// expand a single option object
var expandOptionObject = function(option) {
    // string becomes the value
    if (typeof option === 'string') {
        option = {
			optionHTML: encode(option),
			pieceHTML: encode(option),
            value: option
        };
    }

    return option;
};

// expand a single List Object
var expandListObject = function(list) {
	// an array is shorthand for options
	if (Array.isArray(list) === true) {
		list = {
			options: list
		};
	}

	// a string is shorthand for the AJAX url
	if (typeof list === 'string') {
		list = {
            ajaxEnabled: true,
			url: list
		};
	}

	// default for allowFreeform is false
	if (list.allowFreeform !== true) {
		list.allowFreeform = false;
	}

    // default for maxOptions is false
    if (typeof list.maxOptions !== 'number' || list.maxOptions < 0) {
        list.maxOptions = false;
    }

	// noResults default
	if (typeof list.noResultsHTML !== 'string' && typeof list.noResultsHTML !== 'function') {
		list.noResultsHTML = 'No results found.';
	}

	// searchingHTML default
	if (typeof list.searchingHTML !== 'string' && typeof list.searchingHTML !== 'function') {
		list.searchingHTML = 'Searching';
	}

	// set options to an empty array if it does not exist
	if (Array.isArray(list.options) !== true) {
		list.options = [];
	}

	// expand options
	for (var i = 0; i < list.options.length; i++) {
		list.options[i] = expandOptionObject(list.options[i]);
	}

	return list;
};

var initConfig = function() {
	// if cfg is an array or a string, then it is a single list object
	if (Array.isArray(cfg) === true || typeof cfg === 'string') {
		cfg = {
			initialList: 'default',
			lists: {
				'default': cfg
			}
		};
	}

    // TODO: showClearBtn
    // TODO: clearBtnHTML
    // TODO: maxChunks

    // class prefix
    if (typeof cfg.classPrefix !== 'string' || cfg.classPrefix === '') {
        cfg.classPrefix = 'autocomplete';
    }

	// expand lists
	for (var i in cfg.lists) {
		if (cfg.lists.hasOwnProperty(i) !== true) continue;

		cfg.lists[i] = expandListObject(cfg.lists[i]);
	}
};

//--------------------------------------------------------------
// Markup Building Functions
//--------------------------------------------------------------

var buildWidget = function() {
    var html = '' +
    '<div class="' + cfg.classPrefix + '_internal_container">' +
      '<div class="pieces_container" data-value="[]"></div>' +
      '<input type="text" class="input_proxy" style="visibility:hidden" />' +
	  '<div class="clearfix"></div>' +
      '<ul class="dropdown" style="display:none"></ul>' +
    '</div>';

    return html;
};

var buildOptionHTML = function(option, parentList) {
    if (typeof option.optionHTML === 'string') {
		return option.optionHTML;
    }

	if (typeof option.optionHTML === 'function') {
		return option.optionHTML(option);
    }

	if (typeof parentList.optionHTML === 'function') {
        return parentList.optionHTML(option);
    }

	if (typeof option.value === 'string') {
		return encode(option.value);
    }

    // NOTE: this should never happen, but rather have it here just in case
	//       should I throw an error here?
	return '<em>unknown option</em>';
};

var buildOption = function(option, parentList) {
    var optionId = createId();
    VISIBLE_OPTIONS[optionId] = option;

    var childrenListName = getChildrenListName(option, parentList);

    var html = '<li class="option" ' +
    'data-option-id="' + encode(optionId) + '">' +
	buildOptionHTML(option, parentList);

    if (typeof childrenListName === 'string') {
        html += '<span class="children-indicator">&rarr;</span>';
    }

	html += '</li>';

    return html;
};

// TODO: this function could be more efficient
var buildOptions = function(options, parentList) {
	VISIBLE_OPTIONS = {};
	
    var html = '';
	var groups = getGroups(options);
	var i;

	// sort the groups
	if (typeof parentList.groupSort === 'function') {
		groups.sort(parentList.groupSort);
	}
	else {
		groups.sort();
	}

	// build all options without groups first
	for (i = 0; i < options.length; i++) {
		if (typeof options[i].group !== 'string') {
			html += buildOption(options[i], parentList);
		}
	}

	// build the groups
	for (i = 0; i < groups.length; i++) {
		html += '<li class="group">' + encode(groups[i]) + '</li>';

		for (var j = 0; j < options.length; j++) {
			if (groups[i] === options[j].group) {
				html += buildOption(options[j], parentList);
			}
		}
	}

    return html;
};

var buildPieceHTML = function(option, parentList) {
	if (typeof option.pieceHTML === 'string') {
		return option.pieceHTML;
	}

	if (typeof option.pieceHTML === 'function') {
		return option.pieceHTML(option);
	}

	if (typeof parentList.pieceHTML === 'function') {
		return parentList.pieceHTML(option);
	}

	// default to optionHTML
	return buildOptionHTML(option, parentList);
};

var buildPieces = function(chunks, showChildIndicatorAtEnd) {
	if (showChildIndicatorAtEnd !== true) {
		showChildIndicatorAtEnd = false;
	}

	var html = '';

	for (var i = 0; i < chunks.length; i++) {
		var pieces = chunks[i];

		html += '<div class="chunk" data-chunkIndex="' + i + '">' +
		'<span class="remove-chunk">&times;</span>';

		for (var j = 0; j < pieces.length; j++) {
			html += '<span class="piece">' +
			pieces[j].pieceHTML + '</span>';

			// show child indicator
			if ((pieces.length !== 1 && j !== (pieces.length-1))
				|| (i === (chunks.length-1) && j === (pieces.length-1)
				    && showChildIndicatorAtEnd === true)) {
				html += '<span class="child-indicator">:</span>';
			}
		}
		html += '</div>'; // end div.chunk
	}

	return html;
};

var buildNoResults = function(html) {
	return '<li class="no-results">' + html + '</li>';
};

//--------------------------------------------------------------
// Control Flow / DOM Manipulation
//--------------------------------------------------------------

var removeList = function(listName) {
    // TODO: write me
};

var destroyWidget = function() {
    containerEl.html('');
    // TODO: unbind event handlers on the container element?
};

var clearWidget = function() {
    setValue([]);
    updatePieces();
};

// empty the input element, unhide it, put the focus on it
var showInputEl = function() {
    inputEl.val('').css({
        visibility: '',
        width: '10px'
    }).focus();
};

// hide the input element, empty it, blur focus
var hideInputEl = function() {
    inputEl.css({
        visibility: 'hidden',
        width: '0px'
    }).val('').blur();
};

var positionDropdownEl = function() {
    // get position and height of input element
    var pos = inputEl.position();
    var height = parseInt(inputEl.height(), 10);

    // put the dropdown directly beneath the input element
    listEl.css({
        // TODO: work on the CSS here
        top: height + pos.top + 8,
        left: pos.left
    });
};

var hideDropdownEl = function() {
    listEl.css('display', 'none').html('');
};

// returns the current value of the widget
var getValue = function() {
    var value = [];
    for (var i = 0; i < CHUNKS.length; i++) {
        value[i] = [];

        for (var j = 0; j < CHUNKS[i].length; j++) {
            value[i].push(CHUNKS[i][j].value);
        }
    }

    return value;
};

// set the current value of the widget
var setValue = function(chunks) {
    CHUNKS = chunks;
	ADD_NEXT_PIECE_TO_NEW_CHUNK = true;
    CURRENT_LIST = cfg.lists[cfg.initialList];
    updatePieces();
}

// returns a unique array of groups from an array of Option Objects
var getGroups = function(options) {
	var groups = {};
	for (var i = 0; i < options.length; i++) {
		if (typeof options[i].group === 'string') {
			groups[options[i].group] = 0;
		}
	}
	return objectKeysToArray(groups);
};

var listExists = function(list) {
    if (cfg.lists[list]) {
        return true;
    }
    return false;
};

var startInput = function() {
    // update state
    INPUT_HAPPENING = true;
    if (! CURRENT_LIST) {
        CURRENT_LIST = cfg.lists[cfg.initialList];
    }
	
	clearChunkHighlight();
	showInputEl();
	positionDropdownEl();
	pressRegularKey();
};

var stopInput = function() {
    hideInputEl();
    hideDropdownEl();
    INPUT_HAPPENING = false;
};

var highlightFirstOption = function() {
    highlightOption(listEl.find('li.option').filter(':first'));
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

var removeChunk = function(chunkIndex) {
	// defensive
	chunkIndex = parseInt(chunkIndex, 10);

	// if we are removing the last chunk, then the next piece will start
	// a new chunk
	if (chunkIndex === (CHUNKS.length-1)) {
		CURRENT_LIST = cfg.lists[cfg.initialList];
		ADD_NEXT_PIECE_TO_NEW_CHUNK = true;
	}

	// remove the chunk
	CHUNKS.splice(chunkIndex, 1);

    updatePieces();
	
	if (INPUT_HAPPENING === true) {
		stopInput();
		startInput();
	}
};

var removeHighlightedChunk = function() {
    var chunkIndex = parseInt(piecesEl.find('div.selected').attr('data-chunkIndex'), 10);

    // defensive
    if (validChunkIndex(chunkIndex) !== true) {
		clearChunkHighlight();
		return;
	}

    removeChunk(chunkIndex);
};

var createPieceFromOption = function(option, parentList) {
    var pieceObj = {
        pieceHTML: buildPieceHTML(option, parentList),
        value: option.value
    };

    return pieceObj;
};

// returns false if the option has no children
var getChildrenListName = function(option, parentList) {
    if (typeof option.children === 'string' && listExists(option.children) === true) {
        return option.children;
    }

    if (typeof parentList.children === 'string' && listExists(parentList.children) === true) {
        return parentList.children;
    }

    return false;
};

var addHighlightedOption = function() {
    // get the highlighted value
    var highlightedEl = listEl.find('li.highlighted');

    // do nothing if no entry is highlighted
    if (highlightedEl.length !== 1) return;

	// get the option object
    var optionId = highlightedEl.attr('data-option-id');

    // close input if we did not find the object
    // NOTE: this should never happen, but it's here for a safeguard
    if (! VISIBLE_OPTIONS[optionId]) {
        stopInput();
        return;
    }

    // get the option and the piece
    var option = VISIBLE_OPTIONS[optionId];
    var piece = createPieceFromOption(option, CURRENT_LIST);

    // start a new chunk
	if (ADD_NEXT_PIECE_TO_NEW_CHUNK === true) {
		CHUNKS[CHUNKS.length] = [piece];
	}
	// add the piece to the last chunk
	else {
		CHUNKS[CHUNKS.length-1].push(piece);
	}

    var childrenListName = getChildrenListName(option, CURRENT_LIST);
    // this option has children, move to the next list
    if (typeof childrenListName === 'string') {
        CURRENT_LIST = cfg.lists[childrenListName];
		ADD_NEXT_PIECE_TO_NEW_CHUNK = false;
    }
    // no children, start a new chunk
    else {
        CURRENT_LIST = cfg.lists[cfg.initialList];
        ADD_NEXT_PIECE_TO_NEW_CHUNK = true;
    }

    updatePieces();
    stopInput();
    startInput();
};

var updatePieces = function() {
    piecesEl.html(buildPieces(CHUNKS, false));
};

var filterOptions = function(options, input) {
	input = input.toLowerCase();
	
	if (input === '') {
		return options;
	}
	
	var options2 = [];
	for (var i = 0; i < options.length; i++) {
		// try to match the optionHTML
		if (typeof options[i].optionHTML === 'string') {
			if (input === options[i].optionHTML.toLowerCase().substring(0, input.length)) {
				options2.push(options[i]);
				continue;
			}
		}
		
		// try to match the value
		if (typeof options[i].value === 'string') {
			if (input === options[i].value.toLowerCase().substring(0, input.length)) {
				options2.push(options[i]);
			}
		}
	}
	return options2;
};

var highlightOption = function(optionEl) {
	// remove highlighted from all values in the list
	listEl.find('li.option').removeClass('highlighted');

	// add highlight class to the value clicked
	$(optionEl).addClass('highlighted');
};

//--------------------------------------------------------------
// Input Keypresses
//--------------------------------------------------------------

var pressUpArrow = function() {
    // get the highlighted element
    var highlightedEl = listEl.find('li.highlighted');

    // no row highlighted, highlight the last list element
    if (highlightedEl.length === 0) {
        listEl.find('li.option').last().addClass('highlighted');
        return;
    }

    // remove the highlight from the current element
    highlightedEl.removeClass('highlighted');

    // highlight the previous .value sibling
    highlightedEl.prevAll('li.option').first().addClass('highlighted');
};

var pressDownArrow = function() {
    // get the highlighted element
    var highlightedEl = listEl.find('li.highlighted');

    // no row highlighted, highlight the first _value list element
    if (highlightedEl.length === 0) {
        listEl.find('li.option').first().addClass('highlighted');
        return;
    }

    // remove the highlight from the current element
    highlightedEl.removeClass('highlighted');

    // highlight the next _value sibling
    highlightedEl.nextAll('li.option').first().addClass('highlighted');
};

var pressEscapeKey = function() {
    stopInput();
    clearChunkHighlight();
};

var pressBackspaceOnEmptyInput = function() {
    if (isChunkHighlighted() === true) {
        removeHighlightedChunk();
    }
    else {
        highlightLastChunk();
    }
};

var pressEnterOrTab = function() {
    addHighlightedOption();
};

// TODO: revisit this and make it better for different font sizes, etc
// http://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
var updateInputWidth = function(text) {
	var width = (text.length + 1) * 9;
	inputEl.css('width', width + 'px');
};

var pressRegularKey = function() {
	var inputValue = inputEl.val();
	
	if (inputValue !== '') {
		clearChunkHighlight();
		updateInputWidth(inputValue);
	}
	
	var options = [];

	// filter options with their custom function
	if (typeof CURRENT_LIST.filterOptions === 'function') {
		options = CURRENT_LIST.filterOptions(getValue(), CURRENT_LIST.options, inputValue);
	}
	// else default to mine
	else {
		options = filterOptions(CURRENT_LIST.options, inputValue);
	}

	// no options and input is blank, hide the dropdown list
	if (inputValue === '' && options.length === 0) {
		listEl.css('display', 'none');
		return;
	}
	
	listEl.css('display', '');
	
	// allow freeform?
	if (options.length === 0 && CURRENT_LIST.allowFreeform === true && inputValue !== '') {
		options.push(expandOptionObject(inputValue));
	}

	// no options found :(
	if (options.length === 0) {
		if (typeof CURRENT_LIST.noResultsHTML === 'string') {
			listEl.html(buildNoResults(CURRENT_LIST.noResultsHTML));
		}
		else if (typeof CURRENT_LIST.noResultsHTML === 'function') {
			listEl.html(buildNoResults(CURRENT_LIST.noResultsHTML(getValue(), inputValue)));
		}
		return;
	}
	
	// show new options
	listEl.html(buildOptions(options, CURRENT_LIST));
	highlightFirstOption();
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
	if (INPUT_HAPPENING !== true) return;
	
    var keyCode = e.which;
	var inputValue = inputEl.val();
	
    // enter or tab
    if (keyCode === KEYS.ENTER || keyCode === KEYS.NUMPAD_ENTER
		|| keyCode === KEYS.TAB) {
        e.preventDefault();
		pressEnterOrTab();
        return;
    }

    // backspace on an empty field
    if (keyCode === KEYS.BACKSPACE && inputValue === '') {
        e.preventDefault();
        e.stopPropagation();
        pressBackspaceOnEmptyInput();
        return;
    }

    // down arrow
    if (keyCode === KEYS.DOWN) {
        pressDownArrow();
        return;
    }

    // up arrow
    if (keyCode === KEYS.UP) {
        pressUpArrow();
        return;
    }

    // escape
    if (keyCode === KEYS.ESCAPE) {
        pressEscapeKey();
        return;
    }
	
	// else it's a regular key press
	// NOTE: took this from jquery-tokeninput
	//       you let the keydown event finish so the input element
	//       gets updated, then you grab the value
	//       otherwise you're re-writing the logic behind <input type="text"> elements
	// TODO: revisit this
	setTimeout(pressRegularKey, 5);
	
	/*
	var letter = String.fromCharCode(keyCode);
	
	// do nothing on non-letter keys
	if (letter === '') return;
	
	// shift
	if (e.shiftKey === false) {
		letter = letter.toLowerCase();
	}
	*/
};

// user clicks a dropdown option
var clickOption = function(e) {
    // highlight it
    highlightOption(this);

    // add it
	addHighlightedOption();
};

var mouseoverOption = function() {
    highlightOption(this);
};

var clickChunk = function(e) {
    e.stopPropagation();

    // remove highlight from other chunks
    clearChunkHighlight();

    // highlight this chunk
    $(this).addClass('selected');

    stopInput();
};

// TODO this needs to be better; should run up the DOM from the e.target
//      and check to see if the element is within containerEl
//      right now this doesn't work with multiple widgets on the same page
var clickPage = function(e) {
	stopInput();
};

// keydown anywhere on the page
var keydownWindow = function(e) {
	if (INPUT_HAPPENING === true) return;
	
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
    containerEl.on('click', 'li.option', clickOption);
    containerEl.on('mouseover', 'li.option', mouseoverOption);
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
    initConfig();
    initDom();
    addEvents();
};
init();

// return a new object
return {
    addList: function(name, list) {

    },
    addOption: function(listName, option) {

    },
    blur: function() {
        stopInput();
    },
    clear: function() {
        clearWidget();
    },
    destroy: function() {
        destroyWidget();
    },
    focus: function() {
        startInput();
    },
    getList: function(listName) {

    },
    getLists: function() {

    },

    reload: function(config) {
        // TODO: write me
    },

    // returns false if the chunkIndex is invalid
    // returns the new value of the widget otherwise
    removeChunk: function(chunkIndex) {
        if (validChunkIndex(chunkIndex) !== true) return false;
        removeChunk(chunkIndex);
        return getValue();
    },

    removeList: function(listName) {
        // return false if the list does not exist
        if (listExists(listName) !== true) return false;

        removeList(listName);
        return true;
    },

    val: function(newValue) {
        // set a new value
        if (newValue && validValueArray(newValue) === true) {
            setValue(newValue);
            return true;
        }
        // else return the current value
        else {
            return getValue();
        }
    }
};

// end window.AutoComplete()
};