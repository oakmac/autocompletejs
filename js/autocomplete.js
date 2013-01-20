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

// TODO: do not re-initialize AutoComplete if it already exists

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


var ALLOW_FREEFORM = false;
if (opts.allowFreeform === true) {
    ALLOW_FREEFORM = true;
}

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

// this is a stateful variable that contains the values for the current dropdown list
var CURRENT_VALUES = VALUES;

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

// build the markup inside the container
var buildMarkup = function() {
    var html = '' +
    '<div class="' + CLASS_PREFIX + '_internal_container">' +
      '<div class="pieces_container"></div>' +
      '<input type="text" class="input_proxy" style="display:none" />' +
      '<ul class="autocomplete_list" style="display:none"></ul>' +
    '</div>';

    return html;
};

// build the markup inside the container
containerEl.html(buildMarkup());

// initialize the value
// TODO: allow the user to pre-initialize this
containerEl.attr('data-value', '[]');

// grab elements in memory
var inputProxyEl = containerEl.find('input.input_proxy');
var autocompleteListEl = containerEl.find('ul.autocomplete_list');
var piecesEl = containerEl.find('div.pieces_container');

// move the autocomplete container directly underneath the input element
// and show it
var showAutocompleteEl = function() {
    // get position and height of input proxy element
    var pos = inputProxyEl.position();
    var height = inputProxyEl.height();

    // put the autocomplete list direclty beneath the input proxy
    autocompleteListEl.css({
        display: '',
        position: 'absolute',
        top: height,
        left: pos.left
    });
};

// returns true or false
var hasGroups = function() {
    for (var i = 0; i < CURRENT_VALUES.length; i++) {
        if (CURRENT_VALUES[i].group && CURRENT_VALUES[i].group !== '') {
            return true;
        }
    }
    return false;
};

var buildOption = function(name, index, highlighted) {
    var html = '<li class="value';
    if (highlighted === true) {
        html += ' highlighted';
    }
    html += '" data-index="' + index + '">' + encode(name) + '</li>';

    return html;
};

// build autocomplete options
// NOTE: what to do about sorting by groups?
var buildOptions = function() {
    var html = '';
    var current_group = '';
    for (var i = 0; i < CURRENT_VALUES.length; i++) {
        // group <li>
        if (CURRENT_VALUES[i].group && CURRENT_VALUES[i].group !== current_group) {
            html += '<li class="group">' +
                encode(CURRENT_VALUES[i].group) + '</li>';
            current_group = CURRENT_VALUES[i].group;
        }

        if (i === 0) {
            html += buildOption(CURRENT_VALUES[i].name, i, true);
        }
        else {
            html += buildOption(CURRENT_VALUES[i].name, i);
        }
    }
    return html;
};

// open an input element and prep it for typing
var startAutocomplete = function() {
    // empty the input element
    // unhide it
    // put the focus on it
    inputProxyEl.val('').css('display', '').focus();

    // fill the autocomplete container with elements
    autocompleteListEl.html(buildOptions());

    // show the autocomplete container
    showAutocompleteEl();

    INPUT_HAPPENING = true;
};

var endAutocomplete = function() {
    inputProxyEl.css('display', 'none').blur();
    autocompleteListEl.css('display', 'none').html('');
    INPUT_HAPPENING = false;
};

// click on the container
var clickContainerElement = function() {
    startAutocomplete();
};

var buildPiece = function(piece) {
    var html = '' +
    '<div class="piece">' +
    encode(piece.name) +
    '</div>';

    return html;
};

var updateWidgetPieces = function() {
    var value = JSON.parse(containerEl.attr('data-value'));

    var html = '';
    for (var i = 0; i < value.length; i++) {
        html += buildPiece(value[i]);
    }
    piecesEl.html(html);
};

var addHighlightedValue = function() {
    // get the highlighted value
    var highlightedEl = autocompleteListEl.find('li.highlighted');

    // do nothing if no entry is highlighted
    if (highlightedEl.length !== 1) return;

    // get the index of the current selection
    var index = parseInt($(highlightedEl[0]).attr('data-index'), 10);

    // bail if we do not find the index in CURRENT_VALUES
    // NOTE: this should never happen
    if (! CURRENT_VALUES[index]) return;

    // add the selection to the widget
    var widgetValue = JSON.parse(containerEl.attr('data-value'));
    widgetValue.push({
        name: CURRENT_VALUES[index].name,
        value: CURRENT_VALUES[index].value
    });
    containerEl.attr('data-value', JSON.stringify(widgetValue));

    // update the widget's display
    updateWidgetPieces();

    // end the input
    endAutocomplete();

    // if this piece has children, then open a new autocomplete with them
    if (CURRENT_VALUES[index].children) {
        CURRENT_VALUES = CURRENT_VALUES[index].children;
        startAutocomplete();
    }
    // else reset to the default state
    else {
        CURRENT_VALUES = VALUES;
    }
};

var pressTabKey = function() {
    addHighlightedValue();
};

var pressEnterKey = function() {
    addHighlightedValue();
};

// press the up arrow in the input proxy
var pressUpArrow = function() {
    // get the highlighted element
    var highlightedEl = autocompleteListEl.find('li.highlighted');

    // no row highlighted, highlight the last list element
    if (highlightedEl.length === 0) {
        autocompleteListEl.find('li.value').last().addClass('highlighted');
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
    var highlightedEl = autocompleteListEl.find('li.highlighted');

    // no row highlighted, highlight the first _value list element
    if (highlightedEl.length === 0) {
        autocompleteListEl.find('li.value').first().addClass('highlighted');
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
    // get the value they clicked
    //var valueEl = this;

    // hide the autocomplete list

    // store the value

};

// keyup on the input elmeent
var keyupInputElement = function(e) {
    //var keyCode = e.which;
    //var ignoreCodes = [9, 13, 8, 40, 38, 27];
    //console.log("field value: " + inputProxyEl.val());
};

var filterAutocomplete = function() {
    //console.log( inputProxyEl.val() );
};

// keydown on the input element
var keydownInputElement = function(e) {
    var keyCode = e.which;

    // tab
    if (keyCode === 9) {
        e.preventDefault();
        pressTabKey();
        return;
    }

    // enter
    if (keyCode === 13) {
        e.preventDefault();
        pressEnterKey();
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

// event handlers
// TODO: catch clicks outside the container element and lose the input focus
containerEl.on('click', clickContainerElement);
containerEl.on('keydown', 'input.input_proxy', keydownInputElement);
containerEl.on('keyup', 'input.input_proxy', keyupInputElement);
containerEl.on('click', 'li.value', clickValue);

// end window.AutoComplete()
};