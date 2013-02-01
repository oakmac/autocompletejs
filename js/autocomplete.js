/*!
 * AutoCompleteJS JavaScript Widget
 * http://autocompletejs.com/
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://autocompletejs.com/license
 *
 * Date: 25 Jan 2013
 */


// TODO: "Much love to my PROS co-workers for inspiration, suggestions, and guinea-pigging."
// TODO: expose the htmlEncode and tmpl functions on the AutoComplete object so people can use them
//       in their buildHTML functions
// TODO: matchOptions should take a callback in the args - definitely!
// TODO: allow children on the List Object to be a function
// TODO: if there is only one list, you shouldn't have to specify an initialList


;(function() {
window['AutoComplete'] = window['AutoComplete'] || function(containerElId, cfg) {
'use strict';

//----------------------------------------------------------
// Module scope variables
//----------------------------------------------------------

// constants
var HTML_ENTITIES = [
  [/&/g, '&amp;'],
  [/</g, '&lt;'],
  [/>/g, '&gt;'],
  [/"/g, '&quot;'],
  [/'/g, '&#39;'],
  [/\//g, '&#x2F']
];

var KEYS = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  NUMPAD_ENTER: 108
};

// DOM elements
var containerEl, dropdownEl, inputEl, tokensEl;

// CSS class names
var CLASSES = {
  highlightedOption: 'highlighted',
  selectedTokenGroup: 'selected',
  tokenGroup: 'token-group'
};

// stateful
var ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
//var AJAX_BUFFER_LENGTH = 20;
//var AJAX_BUFFER_TIMEOUT;
var CURRENT_LIST_NAME = false;
var INPUT_HAPPENING = false;
var JQUERY_AJAX_OBJECT = {};
var LOCAL_STORAGE_AVAILABLE = false;
var TOKENS = [];
var VISIBLE_OPTIONS = {};

// constructor return object
var widget = {};

//----------------------------------------------------------
// Util Functions
//----------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

var deepCopy = function(thing) {
  return JSON.parse(JSON.stringify(thing));
};

// html escape
var encode = function(str) {
  str = str + '';
  for (var i = 0; i < HTML_ENTITIES.length; i++) {
    str = str.replace(HTML_ENTITIES[i][0], HTML_ENTITIES[i][1]);
  }
  return str;
};

// copied from modernizr
var hasLocalStorage = function() {
  var str = createId();
  try {
    localStorage.setItem(str, str);
    localStorage.removeItem(str);
    return true;
  } catch (e) {
    return false;
  }
};
LOCAL_STORAGE_AVAILABLE = hasLocalStorage();

var isArray = Array.isArray || function(vArg) {
  return Object.prototype.toString.call(vArg) === '[object Array]';
};

var isObject = function(thing) {
  return (Object.prototype.toString.call(thing) === '[object Object]');
};

// returns the number of keys that an object has
var numObjKeys = function(obj) {
  var count = 0;
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
    count++;
  }
  return count;
};

var objectKeysToArray = function(obj) {
  var arr = [];
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
    arr.push(i);
  }
  return arr;
};

// simple string replacement
var tmpl = function(str, obj, htmlEscape) {
  if (htmlEscape !== true) {
    htmlEscape = false;
  }

  for (var i in obj) {
    // TODO: what to do about things that are not strings here?
    //       like numbers?
    if (obj.hasOwnProperty(i) !== true || typeof obj[i] !== 'string') {
      continue;
    }
    var value = obj[i];
    if (htmlEscape === true) {
      value = encode(value);
    }

    str = str.replace(new RegExp('{' + i + '}', 'g'), value);
  }
  return str;
};

//----------------------------------------------------------
// Validation
//----------------------------------------------------------

// list name must be a non-empty string
var validListName = function(name) {
  return (typeof name === 'string' && name !== '');
};

var validTokenGroupIndex = function(index) {
  if (typeof index !== 'number') {
    return false;
  }

  index = parseInt(index, 10);
  if (index < 0 || index >= TOKENS.length) {
    return false;
  }

  return true;
};

var validToken = function(token) {
  // string is ok
  if (typeof token === 'string') {
    return true;
  }

  // else it must be an object
  if (isObject(token) !== true) {
    return false;
  }

  // else must be an object with .value and .tokenHTML
  // and .tokenHTML must be a string
  if (isObject(token) !== true ||
      token.hasOwnProperty('value') !== true ||
      token.hasOwnProperty('tokenHTML') !== true ||
      typeof token.tokenHTML !== 'string') {
    return false;
  }

  return true;
};

var validTokenGroup = function(tokenGroup) {
  if (isArray(tokenGroup) !== true) {
    return false;
  }

  // token group must have at least one item in it
  if (tokenGroup.length === 0) {
    return false;
  }

  for (var i = 0; i < tokenGroup.length; i++) {
    if (validToken(tokenGroup[i]) !== true) {
      return false;
    }
  }

  return true;
};

var validValue = function(value) {
  if (isArray(value) !== true) {
    return false;
  }

  for (var i = 0; i < value.length; i++) {
    if (validTokenGroup(value[i]) !== true) {
      return false;
    }
  }
  return true;
};

var validOption = function(option) {
  // option can be just a string
  if (typeof option === 'string') {
    return true;
  }

  // else it must be an object with a .value property
  if (isObject(option) !== true ||
      option.hasOwnProperty('value') !== true) {
    return false;
  }

  return true;
};

var validListObject = function(obj) {

  // TODO: write me
  // TODO: show an error when a value.children is not a valid list option

  return true;
};

var error = function(code, msg, obj) {
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  // TODO: we should check that console.log is defined if they set showErrors to "console"
  //       do this check on the config init though

  var errorText = 'AutoComplete Error ' + code + ': ' + msg;
  if (cfg.showErrors === 'console') {
    console.log(errorText);
    if (arguments.length >= 2) {
      console.log(obj);
    }
    return;
  }

  if (cfg.showErrors === 'alert') {
    if (obj) {
      errorText += '\n\n' + JSON.stringify(obj);
    }
    window.alert(errorText);
    return;
  }

  if (typeof cfg.showErrors === 'function') {
    cfg.showErrors(code, msg, obj);
  }
};

// basic checks before we load the config or show anything on screen
// NOTE: these are just being alerted and not going through the normal
//       error process because they happen before any config is loaded
var sanityChecks = function() {
  // container ID must be a string
  if (typeof containerElId !== 'string' || containerElId === '') {
    window.alert('AutoComplete Error 1001: The first argument to AutoComplete() must be a non-empty string.\n\nExiting...');
    return false;
  }

  // make sure the container element exists in the DOM
  if (! document.getElementById(containerElId)) {
    window.alert('AutoComplete Error 1002: Element with id "' + containerElId + '" does not exist in the DOM.\n\nExiting...');
    return false;
  }

  // JSON must exist
  if (window.hasOwnProperty('JSON') !== true
      || typeof JSON.stringify !== 'function'
      || typeof JSON.parse !== 'function') {
    window.alert('AutoComplete Error 1003: JSON does not exist. Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check that jQuery exists
  // NOTE: what else do I need to check here? what if they have put jQuery elsewhere - window.jQuery?
  //       allow them to pass in their version of jquery into the constructor?
  // TODO: what version of jQuery should I check against?
  if (window.hasOwnProperty('$') !== true) {
    window.alert('AutoComplete Error 1004: jQuery does not exist. Please include jQuery on the page.\n\nExiting...');
    return false;
  }

  return true;
};

//----------------------------------------------------------
// Expand Shorthand / Set Default Options
//----------------------------------------------------------

var expandTokenObject = function(token) {
  if (typeof token === 'string') {
    token = {
      tokenHTML: encode(token),
      value: token
    };
  }

  return token;
};

var expandValue = function(value) {
  for (var i = 0; i < value.length; i++) {
    for (var j = 0; j < value[i].length; j++) {
      value[i][j] = expandTokenObject(value[i][j]);
    }
  }
  return value;
};

// expand a single option object
var expandOptionObject = function(option, parentList) {
  // string becomes the value
  if (typeof option === 'string') {
    option = {
      optionHTML: encode(option),
      tokenHTML: encode(option),
      value: option
    };
    return option;
  }

  // build optionHTML and tokenHTML
  option.optionHTML = buildOptionHTML(option, parentList);
  option.tokenHTML = buildTokenHTML(option, parentList);

  return option;
};

// expand a List Object
var expandListObject = function(list) {
  // an array is shorthand for options
  if (isArray(list) === true) {
    list = {
      options: list
    };
  }

  // a string is shorthand for the AJAX url
  if (typeof list === 'string') {
    list = {
      url: list
    };
  }

  // if they have included a URL, ajax is turned on
  if (typeof list.url === 'string' || typeof list.url === 'function') {
    list.ajaxEnabled = true;
  }

  // default for ajaxEnabled is false
  if (list.ajaxEnabled !== true) {
    list.ajaxEnabled = false;
  }

  // default for allowFreeform is false
  if (list.allowFreeform !== true) {
    list.allowFreeform = false;
  }

  // default for cacheAjax is true
  if (typeof list.cacheAjax !== false) {
    list.cacheAjax = true;
  }

  // default for highlightMatches is true
  if (list.highlightMatches !== false) {
    list.highlightMatches = true;
  }

  if (typeof list.matchProperties === 'string') {
    list.matchProperties = [list.matchProperties];
  }

  // noResultsHTML default
  if (typeof list.noResultsHTML !== 'string' && typeof list.noResultsHTML !== 'function') {
    list.noResultsHTML = 'No results found.';
  }

  // searchingHTML default
  if (typeof list.searchingHTML !== 'string' && typeof list.searchingHTML !== 'function') {
    list.searchingHTML = 'Searching';
  }

  // set options to an empty array if it does not exist
  if (isArray(list.options) !== true) {
    list.options = [];
  }

  // expand options
  for (var i = 0; i < list.options.length; i++) {
    list.options[i] = expandOptionObject(list.options[i], list);
  }

  return list;
};

var expandConfig = function() {
  // if cfg is an array or a string, then it is a single list object
  if (isArray(cfg) === true || typeof cfg === 'string') {
    cfg = {
      initialList: 'default',
      lists: {
        'default': cfg
      }
    };
  }

  // TODO: showClearBtn
  // TODO: clearBtnHTML

  // class prefix
  if (typeof cfg.classPrefix !== 'string' || cfg.classPrefix === '') {
    cfg.classPrefix = 'autocomplete';
  }

  // default for maxTokenGroups is false
  if (typeof cfg.maxTokenGroups !== 'number' || cfg.maxTokenGroups < 0) {
    cfg.maxTokenGroups = false;
  }
  if (typeof cfg.maxTokenGroups === 'number') {
    cfg.maxTokenGroups = parseInt(cfg.maxTokenGroups, 10);
  }

  // onChange must be a function
  if (typeof cfg.onChange !== 'function') {
    cfg.onChange = false;
  }

  // set an initiaValue
  if (cfg.hasOwnProperty('initialValue') === true) {
    // check that the initialValue is valid
    if (validValue(cfg.initialValue) === true) {
      // NOTE: is deepCopy necessary here?
      TOKENS = deepCopy(expandValue(cfg.initialValue));
    }
    // else show an error
    else {
      error(6447, 'Invalid value passed to initialValue', cfg.initialValue);
    }
  }

  // default for showErrors is false
  if (cfg.showErrors !== 'console' && cfg.showErrors !== 'alert' &&
      typeof cfg.showErrors !== 'function') {
    cfg.showErrors = false;
  }

  // expand lists
  for (var i in cfg.lists) {
    if (cfg.lists.hasOwnProperty(i) !== true) continue;

    // check the list name
    if (validListName(i) !== true) {
      error(2642, 'You cannot use the empty string for a list name.');
      delete cfg.lists[i];
      continue;
    }

    // make sure the list is valid
    if (validListObject(cfg.lists[i]) === true) {
      cfg.lists[i] = expandListObject(cfg.lists[i]);
    }
    else {
      error(2535, 'The list object for list "' + i + '" is invalid.', cfg.lists[i]);
      delete cfg.lists[i];
    }
  }
};

//----------------------------------------------------------
// Markup Building Functions
//----------------------------------------------------------

var buildWidget = function() {
  var html = '' +
  '<div class="' + cfg.classPrefix + '_internal_container">' +
    '<div class="tokens"></div>' +
    '<input type="text" class="autocomplete-input" style="visibility:hidden" />' +
    '<div class="clearfix"></div>' +
    '<ul class="dropdown" style="display:none"></ul>' +
  '</div>';

  return html;
};

// TODO: throw error if their optionHTML function did not return a string
// TODO: need to revisit this; was very distracted when I last re-factored it
var buildOptionHTML = function(option, parentList) {
  if (typeof option.optionHTML === 'string') {
    return option.optionHTML;
  }

  if (typeof parentList.optionHTML === 'string' &&
      isObject(option.value) === true) {
    return tmpl(parentList.optionHTML, option.value, true);
  }

  if (typeof parentList.optionHTML === 'function') {
    return parentList.optionHTML(option);
  }

  if (typeof option.value === 'string') {
    return encode(option.value);
  }

  // I guess I could iterate through the option.values
  // and just return the first thing that is a String?
  // Think I'd rather just throw an error.

  // NOTE: this should never happen
  error(5783, 'Unable to create HTML string for optionHTML.', option);
  return '<em>unknown option</em>';
};

var buildOption = function(option, parentList) {
  var optionId = createId();
  VISIBLE_OPTIONS[optionId] = option;

  var childrenListName = getChildrenListName(option, parentList);

  var html = '<li class="option" ' +
  'data-option-id="' + encode(optionId) + '">' +
  option.optionHTML;

  if (typeof childrenListName === 'string') {
    html += '<span class="children-indicator">&rarr;</span>';
  }

  html += '</li>';

  return html;
};

// TODO: this function could be more efficient
var buildOptions = function(options, parentList, appendVisibleOptions) {
  if (appendVisibleOptions !== true) {
    VISIBLE_OPTIONS = {};
  }

  var html = '';
  var groups = getGroups(options);
  var i;

  // sort the groups
  // TODO: need to document this
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

var buildTokenHTML = function(option, parentList) {
  if (typeof option.tokenHTML === 'string') {
    return option.tokenHTML;
  }

  if (typeof parentList.tokenHTML === 'string' &&
      isObject(option.value) === true) {
    return tmpl(parentList.tokenHTML, option.value, true);
  }

  if (typeof parentList.tokenHTML === 'function') {
    return parentList.tokenHTML(option);
  }

  // default to optionHTML
  return buildOptionHTML(option, parentList);
};


// TODO: add click event handler on .remove-token-group


var buildTokens = function(tokens) {
  var html = '';
  for (var i = 0; i < tokens.length; i++) {
    var tokenGroup = tokens[i];

    html += '<div class="' + CLASSES.tokenGroup + '"' +
    ' data-token-group-index="' + i + '">' +
    '<span class="remove-token-group">&times;</span>';

    for (var j = 0; j < tokenGroup.length; j++) {
      html += '<span class="token">' +
      tokenGroup[j].tokenHTML + '</span>';

      // show child indicator
      if (j !== tokenGroup.length - 1) {
        html += '<span class="child-indicator">:</span>';
      }
    }
    html += '</div>'; // end div.token-group
  }

  return html;
};

var buildNoResults = function(noResults, inputValue) {
  var html = '<li class="no-results">';
  var type = typeof noResults;
  if (type === 'string') {
    html += noResults;
  }
  if (type === 'function') {
    html += noResults(getValue(), inputValue);
  }
  html += '</li>';
  return html;
};

var buildSearching = function(searchingHTML, inputValue) {
  var html = '<li class="searching">';
  var type = typeof searchingHTML;
  if (type === 'string') {
    html += searchingHTML;
  }
  if (type === 'function') {
    html += searchingHTML(getValue(), inputValue);
  }
  html += '</li>';
  return html;
};

var buildAjaxError = function() {
  return '<li class="ajax-error">AJAX Error!</li>';
};

//----------------------------------------------------------
// Control Flow / DOM Manipulation
//----------------------------------------------------------

var removeList = function(listName) {
  delete cfg.lists[listName];
  if (CURRENT_LIST_NAME === listName) {
    CURRENT_LIST_NAME = cfg.initialList;
  }
};

var destroyWidget = function() {
  // remove markup
  containerEl.html('');

  // remove event handlers
  containerEl.unbind();
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
  var pos = inputEl.position();
  var height = parseInt(inputEl.height(), 10);

  // put the dropdown directly beneath the input element
  dropdownEl.css({
    top: (height + pos.top),
    left: pos.left
  });
};

var hideDropdownEl = function() {
  dropdownEl.css('display', 'none').html('');
};

// returns the current value of the widget
var getValue = function() {
  return deepCopy(TOKENS);
};

// set the current value of the widget
var setValue = function(newValue) {
  var oldValue = getValue();

  if (typeof cfg.onChange === 'function') {
    var potentialNewValue = cfg.onChange(newValue, oldValue);

    // only change the value if their onChange function returned a valid value
    if (validValue(potentialNewValue) === true) {
      newValue = potentialNewValue;
    }
  }

  // update state
  TOKENS = newValue;
  ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  CURRENT_LIST_NAME = cfg.initialList;
  updateTokens();
};

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

var listExists = function(listName) {
  return (typeof listName === 'string' &&
          cfg.lists.hasOwnProperty(listName) === true);
};

var startInput = function() {
  // have we hit max token groups?
  if (typeof cfg.maxTokenGroups === 'number' &&
      TOKENS.length >= cfg.maxTokenGroups &&
      ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP === true) {
    return;
  }

  // update state
  INPUT_HAPPENING = true;
  if (listExists(CURRENT_LIST_NAME) !== true) {
    CURRENT_LIST_NAME = cfg.initialList;
  }

  clearTokenGroupHighlight();
  showInputEl();
  positionDropdownEl();
  pressRegularKey();
  adjustDropdownScroll();
};

var stopInput = function() {
  if (typeof JQUERY_AJAX_OBJECT.abort === 'function') {
    JQUERY_AJAX_OBJECT.abort();
  }
  hideInputEl();
  hideDropdownEl();
  INPUT_HAPPENING = false;
};

var highlightFirstOption = function() {
  highlightOption(dropdownEl.find('li.option').filter(':first'));
};

var clearTokenGroupHighlight = function() {
  tokensEl.find('div.' + CLASSES.tokenGroup).removeClass(CLASSES.selectedTokenGroup);
};

var highlightLastTokenGroup = function() {
  tokensEl.find('div.' + CLASSES.tokenGroup).
    removeClass(CLASSES.selectedTokenGroup).
    filter(':last').
    addClass(CLASSES.selectedTokenGroup);
};

// returns true if a tokenGroup is highlighted
// false otherwise
var isTokenGroupHighlighted = function() {
  return (tokensEl.find('div.' + CLASSES.selectedTokenGroup).length === 1);
};

var removeTokenGroup = function(tokenGroupIndex) {
  tokenGroupIndex = parseInt(tokenGroupIndex, 10);

  // if we are removing the last token group, then the next token will start
  // a new token group
  if (tokenGroupIndex === (TOKENS.length - 1)) {
    CURRENT_LIST_NAME = cfg.initialList;
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  }

  var newTokens = deepCopy(TOKENS);
  newTokens.splice(tokenGroupIndex, 1);
  setValue(newTokens);

  if (INPUT_HAPPENING === true) {
    stopInput();
    startInput();
  }
};

var removeHighlightedTokenGroup = function() {
  // do nothing if there are no token groups highlighted
  if (isTokenGroupHighlighted() !== true) return;

  var tokenGroupIndex = parseInt(tokensEl
    .find('div.' + CLASSES.selectedTokenGroup)
    .attr('data-token-group-index'), 10);

  // make sure the token group index is valid
  if (validTokenGroupIndex(tokenGroupIndex) !== true) {
    clearTokenGroupHighlight();
    return;
  }

  removeTokenGroup(tokenGroupIndex);
};

var createTokenFromOption = function(option) {
  return {
    tokenHTML: option.tokenHTML,
    value: option.value
  };
};

// returns false if the option has no children
var getChildrenListName = function(option, parentList) {
  if (typeof option.children === 'string' &&
      listExists(option.children) === true) {
    return option.children;
  }

  if (typeof parentList.children === 'string' &&
      listExists(parentList.children) === true) {
    return parentList.children;
  }

  return false;
};

var addHighlightedOption = function() {
  // get the highlighted value
  var highlightedEl = dropdownEl.find('li.' + CLASSES.highlightedOption);

  // do nothing if no entry is highlighted
  if (highlightedEl.length !== 1) return;

  // get the option object
  var optionId = highlightedEl.attr('data-option-id');

  // close input if we did not find the object
  // NOTE: this should never happen, but it's here for a safeguard
  if (! VISIBLE_OPTIONS[optionId]) {
    // TODO: throw error
    stopInput();
    return;
  }

  // get the list, option, and create the token
  var list = cfg.lists[CURRENT_LIST_NAME];
  var option = VISIBLE_OPTIONS[optionId];
  var token = createTokenFromOption(option);

  var newTokens = deepCopy(TOKENS);
  // start a new token group
  if (ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP === true) {
    newTokens.push([token]);
  }
  // add the token to the last token group
  else {
    newTokens[newTokens.length - 1].push(token);
  }
  setValue(newTokens);

  var childrenListName = getChildrenListName(option, list);
  // this option has children, move to the next list
  if (typeof childrenListName === 'string') {
    CURRENT_LIST_NAME = childrenListName;
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = false;
  }
  // no children, start a new token group
  else {
    CURRENT_LIST_NAME = cfg.initialList;
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  }

  updateTokens();
  stopInput();
  startInput();
};

var updateTokens = function() {
  tokensEl.html(buildTokens(TOKENS));
};

// attempts to return all non-HTML characters from a string
var findNonHTMLChars = function(str) {
  var str2 = '';
  var chars = str.split('');

  var inATag = false;
  var inEscapeSequence = false;

  for (var i = 0; i < chars.length; i++) {
    if (chars[i] === '<') {
      inATag = true;
      continue;
    }
    if (inATag === true && chars[i] === '>') {
      inATag = false;
      continue;
    }
    if (chars[i] === '&') {
      inEscapeSequence = true;
      continue;
    }
    if (inEscapeSequence === true && chars[i] === ';') {
      inEscapeSequence = false;
      continue;
    }

    if (inATag === true || inEscapeSequence === true) continue;

    str2 += chars[i];
  }

  return str2;
};

// it is doubtful that there are not bugs in this function
var highlightMatchChars = function(optionHTML, input) {
  var htmlChars = optionHTML.split('');
  var inputChars = input.split('');

  var charsToHighlight = [];
  for (var i = 0; i < inputChars.length; i++) {
    // skip anything that is not alphanumeric
    if (inputChars[i].search(/[^a-zA-Z0-9]/) !== -1) continue;

    charsToHighlight.push(inputChars[i].toLowerCase(), inputChars[i].toUpperCase());
  }

  var inATag = false;
  var inEscapeSequence = false;

  for (var i = 0; i < htmlChars.length; i++) {
    if (htmlChars[i] === '<') {
      inATag = true;
      continue;
    }
    if (inATag === true && htmlChars[i] === '>') {
      inATag = false;
      continue;
    }
    if (htmlChars[i] === '&') {
      inEscapeSequence = true;
      continue;
    }
    if (inEscapeSequence === true && htmlChars[i] === ';') {
      inEscapeSequence = false;
      continue;
    }

    if (inATag === true || inEscapeSequence === true) continue;

    for (var j = 0; j < charsToHighlight.length; j++) {
      if (htmlChars[i] === charsToHighlight[j]) {
        htmlChars[i] = '<strong>' + htmlChars[i] + '</strong>';
        break;
      }
    }
  }

  return htmlChars.join('');
};

// does input match the beginning of str?
var isFrontMatch = function(input, str) {
  return input === str.toLowerCase().substring(0, input.length);
};

// is input a substring inside str?
var isSubstringMatch = function(input, str) {
  return str.toLowerCase().indexOf(input.toLowerCase()) !== -1;
};

// does str contain all of the characters found in input?
var isCharMatch = function(input, str) {
  var chars = input.split(''),
      charsObj = {},
      i;

  for (i = 0; i < chars.length; i++) {
    // only look at alphanumeric
    if (chars[i].search(/[^a-zA-Z0-9]/) !== -1) continue;

    charsObj[chars[i].toLowerCase()] = 0;
  }
  chars = objectKeysToArray(charsObj);

  str = str.toLowerCase();

  for (i = 0; i < chars.length; i++) {
    if (str.indexOf(chars[i]) === -1) {
      return false;
    }
  }
  return true;
};

// returns an array of options that match against ._matchValue
var matchOptionsSpecial = function(options, input) {
  var options2 = [],
      i,
      len = options.length;

  options = deepCopy(options); // necessary?

  // do a front match first
  for (i = 0; i < len; i++) {
    if (isFrontMatch(input, options[i]._matchValue) === true) {
      options2.push(options[i]);
      options[i] = false;
    }
  }

  // then a substring match
  for (i = 0; i < len; i++) {
    // ignore any options we've already matched
    if (options[i] === false) continue;

    if (isSubstringMatch(input, options[i]._matchValue) === true) {
      options2.push(options[i]);
      options[i] = false;
    }
  }

  // then a character match
  for (i = 0; i < len; i++) {
    // ignore any options we've already matched
    if (options[i] === false) continue;

    if (isCharMatch(input, options[i]._matchValue) === true) {
      options2.push(options[i]);
    }
  }

  return options2;
};

// TODO: this needs to be refactored
// investigate: http://jalada.co.uk/2009/07/31/javascript-aho-corasick-string-search-algorithm.html
var matchOptions = function(input, list) {
  var i, matchValue;
  input = input.toLowerCase();

  // return all the options with no user input
  if (input === '') {
    return list.options;
  }

  var options = deepCopy(list.options);
  var options2 = [];

  // do they have a list of properties to match against?
  //if (isArray(list.matchProperties) === true) {
  if (false) {
    // TODO: write me
  }
  // else try to match against the value or optionHTML
  else {

    // set ._matchValue
    for (var i = 0; i < options.length; i++) {
      if (typeof options[i].value === 'string') {
        options[i]._matchValue = options[i].value.toLowerCase();
      }
      else {
        options[i]._matchValue = findNonHTMLChars(options[i].optionHTML.toLowerCase());
      }
    }

    options2 = matchOptionsSpecial(options, input);
  }

  return options2;
};

var highlightOption = function(optionEl) {
  // remove highlighted from all values in the list
  dropdownEl.find('li.option').removeClass(CLASSES.highlightedOption);

  // add highlight class to the value clicked
  $(optionEl).addClass(CLASSES.highlightedOption);
};

var adjustDropdownScroll = function() {
  // find the highlighted option
  var highlightedEl = dropdownEl.find('li.' + CLASSES.highlightedOption);

  // exit if we did not find one
  if (highlightedEl.length !== 1) return;

  var liTop = highlightedEl.position().top;
  var scrollTop = dropdownEl.scrollTop();


  // TODO: if the first option is selected, scrollTop should be set to a negative number
  //       there could be a group <li> above it that you should see


  // option is above the scroll window
  if (liTop < 0) {
    dropdownEl.scrollTop(scrollTop + liTop);
    return;
  }

  var liHeight = highlightedEl.height();
  var ddHeight = dropdownEl.height();

  // option is below the scroll window
  if ((liTop + liHeight) > ddHeight) {
    // not sure why this doesn't work exactly, but seems
    // to work better with the 6px fudge factor
    dropdownEl.scrollTop(scrollTop + liTop + liHeight - ddHeight + 6);
  }
};

//----------------------------------------------------------
// Input Keypresses
//----------------------------------------------------------

var pressUpArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.' + CLASSES.highlightedOption);

  // no row highlighted, highlight the last list element
  if (highlightedEl.length === 0) {
    dropdownEl.find('li.option').last().addClass(CLASSES.highlightedOption);
    adjustDropdownScroll();
    return;
  }

  // remove the highlight from the current element
  highlightedEl.removeClass(CLASSES.highlightedOption);

  // highlight the previous option
  highlightedEl.prevAll('li.option').first().addClass(CLASSES.highlightedOption);
  adjustDropdownScroll();
};

var pressDownArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.' + CLASSES.highlightedOption);

  // no row highlighted, highlight the first option
  if (highlightedEl.length === 0) {
    dropdownEl.find('li.option').first().addClass(CLASSES.highlightedOption);
    adjustDropdownScroll();
    return;
  }

  // remove the highlight from the current element
  highlightedEl.removeClass(CLASSES.highlightedOption);

  // highlight the next option
  highlightedEl.nextAll('li.option').first().addClass(CLASSES.highlightedOption);
  adjustDropdownScroll();
};

var pressEscapeKey = function() {
  stopInput();
  clearTokenGroupHighlight();
};

var moveTokenHighlightLeft = function() {
  var selectedEl = tokensEl.find('div.' + CLASSES.selectedTokenGroup);

  // NOTE: should never happen
  if (selectedEl.length !== 1) {
    return;
  }

  var prev = selectedEl.prev('div.' + CLASSES.tokenGroup);
  selectedEl.removeClass(CLASSES.selectedTokenGroup);
  if (prev.length === 1) {
    prev.addClass(CLASSES.selectedTokenGroup);
  }
  else {
    tokensEl.find('div.' + CLASSES.tokenGroup).filter(':last')
      .addClass(CLASSES.selectedTokenGroup);
  }
};

var moveTokenHighlightRight = function() {
  var selectedEl = tokensEl.find('div.' + CLASSES.selectedTokenGroup);

  // NOTE: should never happen
  if (selectedEl.length !== 1) {
    return;
  }

  var next = selectedEl.next('div.' + CLASSES.tokenGroup);
  selectedEl.removeClass(CLASSES.selectedTokenGroup);
  if (next.length === 1) {
    next.addClass(CLASSES.selectedTokenGroup);
  }
  else {
    tokensEl.find('div.' + CLASSES.tokenGroup).filter(':first')
      .addClass(CLASSES.selectedTokenGroup);
  }
};

var pressBackspaceOnEmptyInput = function() {
  if (isTokenGroupHighlighted() === true) {
    removeHighlightedTokenGroup();
  }
  else {
    highlightLastTokenGroup();
  }
};

var pressEnterOrTab = function() {
  addHighlightedOption();
};

// returns true if there is a valid option showing
// false otherwise
var isOptionShowing = function() {
  return (dropdownEl.find('li.option').length > 0);
};

var isOptionHighlighted = function() {
  return (dropdownEl.find('li.' + CLASSES.highlightedOption).length !== 0);
};

// TODO: revisit this and make it better for different font sizes, etc
// http://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
var updateInputWidth = function(text) {
  var width = (text.length + 1) * 10;
  inputEl.css('width', width + 'px');
};

var sendAjaxRequest = function(list, inputValue) {

  // TODO: allow full jQuery ajax config extend here
  //       just not sure about how to handle scope with the
  //       internal functions

  var url;
  if (typeof list.url === 'string') {
    url = list.url.replace(/\{value\}/g, encodeURIComponent(inputValue));
  }
  if (typeof list.url === 'function') {
    url = list.url(inputValue, getValue());
  }

  // throw an error if url is not a string
  if (typeof url !== 'string') {
    error(8721, 'AJAX url must be a string.  Did your custom url function not return one?', url);
    stopInput();
    return;
  }

  var ajaxSuccess = function(data) {
    // save the result in the cache
    if (list.cacheAjax === true &&
        LOCAL_STORAGE_AVAILABLE === true) {
      localStorage.setItem(url, JSON.stringify(data));
    }

    if (INPUT_HAPPENING !== true) return;

    // run their custom postProcess function
    if (typeof list.postProcess === 'function') {
      data = list.postProcess(data, getValue());
    }

    // expand the options and make sure they're valid
    var options = [];
    if (isArray(data) === true) {
      for (var i = 0; i < data.length; i++) {
        // skip any objects that are not valid Options
        if (validOption(data[i]) !== true) continue;

        options.push(expandOptionObject(data[i], list));
      }
    }

    // no results :(
    var html = '';
    if (options.length === 0 && isOptionShowing() === false) {
      html = buildNoResults(list.noResultsHTML, inputValue);
    }

    // new options
    if (options.length > 0) {
      html = buildOptions(options, list, true);
    }

    dropdownEl.find('li.searching').replaceWith(html);

    // highlight the option if there are no others highlighted
    if (isOptionHighlighted() === false) {
      highlightFirstOption();
    }
  };

  var ajaxError = function(xhr, errType, exceptionObject) {
    //if (errType === 'abort') {
    // TODO: write me
    //}
    if (errType === 'error') {
      dropdownEl.find('li.searching').replaceWith(buildAjaxError());
    }
  };

  // check the cache
  if (list.cacheAjax === true &&
      LOCAL_STORAGE_AVAILABLE === true &&
      // would prefer to check for something more than just truthy here
      localStorage.getItem(url)) {
    ajaxSuccess(JSON.parse(localStorage.getItem(url)));
  }
  // else send the AJAX request
  else {
    JQUERY_AJAX_OBJECT = $.ajax({
      dataType: 'json',
      error: ajaxError,
      success: ajaxSuccess,
      type: 'GET',
      url: url
    });
  }
};

var pressRegularKey = function() {
  var inputValue = inputEl.val();

  if (inputValue !== '') {
    clearTokenGroupHighlight();
    updateInputWidth(inputValue);
  }

  var list = cfg.lists[CURRENT_LIST_NAME];
  var options = [];

  // match options with their custom function
  if (typeof list.matchOptions === 'function') {
    options = list.matchOptions(inputValue, list.options, getValue());
  }
  // else default to mine
  else {
    options = matchOptions(inputValue, list);
  }

  // add freeform as an option if that's allowed
  if (options.length === 0 && inputValue !== '' &&
      list.allowFreeform === true) {
    options.push(expandOptionObject(inputValue, list));
  }

  // no input, no options, no freeform, and no ajax
  // hide the dropdown and exit
  if (options.length === 0 && inputValue === '' &&
      list.ajaxEnabled === false) {
    dropdownEl.css('display', 'none');
    return;
  }

  // else we will show something in the dropdown
  dropdownEl.css('display', '');

  // no options found and no AJAX
  // show "No Results" and exit
  if (options.length === 0 && list.ajaxEnabled === false) {
    dropdownEl.html(buildNoResults(list.noResultsHTML, inputValue));
    return;
  }

  // highlight matches
  if (list.highlightMatches === true) {
    for (var i = 0; i < options.length; i++) {
      options[i].optionHTML = highlightMatchChars(options[i].optionHTML, inputValue);
    }
  }

  // build the options
  var html = buildOptions(options, list);

  // add AJAX indicator
  if (list.ajaxEnabled === true) {
    html += buildSearching(list.searchingHTML, inputValue);
  }

  // show the dropdown
  dropdownEl.html(html);
  highlightFirstOption();

  // send the AJAX request
  // NOTE: we have to send the AJAX request after we've updated the DOM
  //       because of localStorage caching
  if (list.ajaxEnabled === true) {
    // cancel any existing AJAX request
    if (typeof JQUERY_AJAX_OBJECT.abort === 'function') {
      JQUERY_AJAX_OBJECT.abort();
    }
    sendAjaxRequest(list, inputValue);
  }
};

//----------------------------------------------------------
// Browser Events
//----------------------------------------------------------

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
  if (keyCode === KEYS.ENTER ||
      keyCode === KEYS.NUMPAD_ENTER ||
      keyCode === KEYS.TAB) {
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

  // left arrow
  if (keyCode === KEYS.LEFT && inputValue === '') {
    highlightLastTokenGroup();
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
  setTimeout(pressRegularKey, 5);
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

var clickTokenGroup = function(e) {
  e.stopPropagation();
  stopInput();

  // remove highlight from other token groups
  clearTokenGroupHighlight();

  // highlight this token group
  $(this).addClass(CLASSES.selectedTokenGroup);
};

// TODO this needs to be better; should run up the DOM from the e.target
//      and check to see if the element is within containerEl
//      right now this doesn't work with multiple widgets on the same page
var clickPage = function(e) {
  stopInput();
};

// keydown anywhere on the page
var keydownWindow = function(e) {
  if (INPUT_HAPPENING === true ||
      isTokenGroupHighlighted() !== true) {
    return;
  }

  var keyCode = e.which;

  // backspace or delete with a highlighted token group
  if (keyCode === KEYS.BACKSPACE || keyCode === KEYS.DELETE) {
    e.preventDefault();
    removeHighlightedTokenGroup();
    return;
  }

  // escape key
  if (keyCode === KEYS.ESCAPE) {
    clearTokenGroupHighlight();
    return;
  }

  // left
  if (keyCode === KEYS.LEFT) {
    moveTokenHighlightLeft();
    return;
  }

  // right
  if (keyCode === KEYS.RIGHT) {
    moveTokenHighlightRight();
  }
};

var addEvents = function() {
  containerEl.on('click', clickContainerElement);
  containerEl.on('keydown', 'input.autocomplete-input', keydownInputElement);
  containerEl.on('click', 'li.option', clickOption);
  containerEl.on('mouseover', 'li.option', mouseoverOption);
  containerEl.on('click', 'div.' + CLASSES.tokenGroup, clickTokenGroup);

  // catch all clicks on the page
  $('html').on('click', clickPage);

  // catch global keydown
  $(window).on('keydown', keydownWindow);
};

//----------------------------------------------------------
// Public Methods
//----------------------------------------------------------

// returns true if adding the option was successful
// false otherwise
widget.addOption = function(listName, option) {
  // list name must be valid
  if (validListName(listName) !== true) {
    error(8366, 'The first argument to the addOption method must be a non-empty string.');
    return false;
  }

  // list must exist
  if (listExists(listName) !== true) {
    error(5732, 'Error in addOption method. List "' + listName + '" does not exist.');
    return false;
  }

  // option must be valid
  if (validOption(option) !== true) {
    error(7887, 'Invalid option passed to addOption method.', option);
    return false;
  }

  // add the option
  cfg.lists[listName].options.push(option);
  return true;
};

widget.blur = function() {
  stopInput();
};

widget.clear = function() {
  setValue([]);
};

/*
widget.config = function(prop, value) {
  // TODO: write me
  // no args, return the current config

  // else set the new prop and value

  // what's the difference between this function and reload?
};
*/

widget.destroy = function() {
  destroyWidget();
};

widget.focus = function() {
  startInput();
};

// return a list object
// returns false if the list does not exist
widget.getList = function(name) {
  if (validListName(name) !== true) {
    error(2789, 'The first argument to the getList method must be a non-empty string.');
    return false;
  }

  // do not throw error if the list does not exist
  // that's normal behavior for this function
  if (listExists(listName) !== true) {
    return false;
  }

  return cfg.lists[listName];
};

// return all the lists
widget.getLists = function() {
  return cfg.lists;
};

// get the value
widget.getValue = function() {
  return getValue();
};

// shorthand for getList, setList
widget.list = function(name, list) {
  if (arguments.length === 0) {
    return getList(name);
  }

  if (arguments.length === 1) {
    return setList(name, list);
  }

  error(5938, 'Wrong number of arguments passed to list method.');
  return false;
};

/*
widget.reload = function(config) {
  // TODO: write me
};
*/

widget.removeList = function(name) {
  // name must be valid
  if (validListName(name) !== true) {
    error(2231, 'The first argument to the removeList method must be a non-empty string.');
    return false;
  }

  // return false if the list does not exist
  if (listExists(name) !== true) {
    error(1328, 'Error in removeList method. List "' + name + '" does not exist.');
    return false;
  }

  // they cannot remove the initialList
  if (name === cfg.initialList) {
    error(1424, 'Error in removeList method. You cannot remove the initialList "' + name + '"');
    return false;
  }

  removeList(name);
  return true;
};

// returns false if the token group index is invalid
// returns the new value of the widget otherwise
widget.removeTokenGroup = function(tokenGroupIndex) {
  if (validTokenGroupIndex(tokenGroupIndex) !== true) {
    error(4823, 'Error in removeTokenGroup method. Token group index "' + tokenGroupIndex + '" does not exist.');
    return false;
  }

  removeTokenGroup(tokenGroupIndex);
  return getValue();
};

// returns true if updating the list was successful
// false otherwise
widget.setList = function(name, list) {
  // name must be valid
  if (validListName(name) !== true) {
    error(7283, 'The first argument to the setList method must be a non-empty string.');
    return false;
  }

  // list must be valid
  if (validListObject(list) !== true) {
    error(2732, 'The list object passed to setList method is not valid.', list);
    return false;
  }

  // add the list
  cfg.lists[name] = expandListObject(list);
  return true;
};

widget.setValue = function(value) {
  if (validValue(value) !== true) {
    error(6823, 'Invalid value passed to setValue method.', value);
    return false;
  }
  setValue(value);
  return true;
};

// shorthand for getValue and setValue
widget.val = function(value) {
  if (arguments.length === 0) {
    return getValue();
  }

  if (arguments.length === 1) {
    return setValue(value);
  }

  error(9992, 'Wrong number of arguments passed to val method.');
  return false;
};

//----------------------------------------------------------
// Initialization
//----------------------------------------------------------

var initDom = function() {
  // get the container element
  containerEl = $('#' + containerElId);

  // build the markup inside the container
  containerEl.html(buildWidget());

  // grab elements in memory
  inputEl = containerEl.find('input.autocomplete-input');
  dropdownEl = containerEl.find('ul.dropdown');
  tokensEl = containerEl.find('div.tokens');
};

var init = function() {
  if (sanityChecks() !== true) return;

  expandConfig();
  initDom();
  addEvents();
  updateTokens();
};
init();

// return the widget
return widget;

}; // end window.AutoComplete
})(); // end anonymous wrapper
