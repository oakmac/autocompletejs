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
// TODO: filterOptions should take a callback in the args
// TODO: show an error when a value.children is not a valid list option


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

// stateful
var ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
var AJAX_BUFFER_LENGTH = 20;
var AJAX_BUFFER_TIMEOUT;
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
// simple string replacement
var tmpl = function(str, obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i) !== true) continue;
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
    if (obj.hasOwnProperty(i) !== true) continue;
    arr.push(i);
  }
  return arr;
};

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

var isArray = Array.isArray || function(vArg) {
  return Object.prototype.toString.call(vArg) === '[object Array]';
};

var isObject = function(thing) {
  return (Object.prototype.toString.call(thing) === '[object Object]');
};

var deepCopy = function(thing) {
  return JSON.parse(JSON.stringify(thing));
};

// copied from modernizr
var hasLocalStorage = function() {
  var str = 'test';
  try {
    localStorage.setItem(str, str);
    localStorage.removeItem(str);
    return true;
  } catch(e) {
    return false;
  }
};
LOCAL_STORAGE_AVAILABLE = hasLocalStorage();

//----------------------------------------------------------
// Validation
//----------------------------------------------------------

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

  return false;
};

var validListObject = function(obj) {
  // TODO: write me
  return true;
};

var error = function(code, msg, obj) {
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  // NOTE: should we check that window.console.log is defined on
  //       initial config?

  var errorText = 'AutoComplete Error ' + code + ': ' + msg;
  if (cfg.showErrors === 'console') {
    console.log(errorText);
    if (obj) {
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

var checkDeps = function() {
  // TODO: make sure jQuery is defined
  // TODO: make sure JSON is defined
  return true;
};

// basic checks before we load the config or show anything on screen
var sanityChecks = function() {
  // container ID must be a string
  if (typeof containerElId !== 'string' || containerElId === '') {
    error(1001, 'Container element id must be a non-empty string.');
    return false;
  }

  // make sure the container element exists in the DOM
  if (! document.getElementById(containerElId)) {
    error(1002, 'Element with id "' + containerElId + '" does not exist in DOM.');
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
var expandOptionObject = function(option) {
  // string becomes the value
  if (typeof option === 'string') {
    option = {
      value: option
    };
  }

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
      ajaxEnabled: true,
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

  // default for maxOptions is false
  if (typeof list.maxOptions !== 'number' || list.maxOptions < 1) {
    list.maxOptions = false;
  }
  if (typeof list.maxOptions === 'number') {
    list.maxOptions = parseInt(list.maxOptions, 10);
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
  if (isArray(list.options) !== true) {
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
      // TODO: is deepCopy necessary here?
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
    cfg.lists[i] = expandListObject(cfg.lists[i]);
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

// TODO: need to add a check here that the return value of optionHTML()
//       and tokenHTML are strings
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
  buildOptionHTML(option, parentList);

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

  if (typeof option.tokenHTML === 'function') {
    return option.tokenHTML(option);
  }

  if (typeof parentList.tokenHTML === 'function') {
    return parentList.tokenHTML(option);
  }

  // default to optionHTML
  return buildOptionHTML(option, parentList);
};

var buildTokens = function(tokens) {
  var html = '';
  for (var i = 0; i < tokens.length; i++) {
    var tokenGroup = tokens[i];

    html += '<div class="token-group" data-token-group-index="' + i + '">' +
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
  containerEl.html('');
  // TODO: unbind event handlers on the container element?
};

var clearWidget = function() {
  setValue([]);
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
  tokensEl.find('div.token-group').removeClass('selected');
};

var highlightLastTokenGroup = function() {
  tokensEl.find('div.token-group').
    removeClass('selected').
    filter(':last').
    addClass('selected');
};

// returns true if a tokenGroup is highlighted
// false otherwise
var isTokenGroupHighlighted = function() {
  return (tokensEl.find('div.selected').length === 1);
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

  var tokenGroupIndex = tokensEl.find('div.selected').attr('data-token-group-index');
  tokenGroupIndex = parseInt(tokenGroupIndex, 10);

  // make sure the token group index is valid
  if (validTokenGroupIndex(tokenGroupIndex) !== true) {
    clearTokenGroupHighlight();
    return;
  }

  removeTokenGroup(tokenGroupIndex);
};

var createTokenFromOption = function(option, parentList) {
  var token = {
    tokenHTML: buildTokenHTML(option, parentList),
    value: option.value
  };
  return token;
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
  var highlightedEl = dropdownEl.find('li.highlighted');

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
  var token = createTokenFromOption(option, list);

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
  dropdownEl.find('li.option').removeClass('highlighted');

  // add highlight class to the value clicked
  $(optionEl).addClass('highlighted');
};

//----------------------------------------------------------
// Input Keypresses
//----------------------------------------------------------

var pressUpArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.highlighted');

  // no row highlighted, highlight the last list element
  if (highlightedEl.length === 0) {
    dropdownEl.find('li.option').last().addClass('highlighted');
    return;
  }

  // remove the highlight from the current element
  highlightedEl.removeClass('highlighted');

  // highlight the previous option
  highlightedEl.prevAll('li.option').first().addClass('highlighted');
};

var pressDownArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.highlighted');

  // no row highlighted, highlight the first option
  if (highlightedEl.length === 0) {
    dropdownEl.find('li.option').first().addClass('highlighted');
    return;
  }

  // remove the highlight from the current element
  highlightedEl.removeClass('highlighted');

  // highlight the next option
  highlightedEl.nextAll('li.option').first().addClass('highlighted');
};

var pressEscapeKey = function() {
  stopInput();
  clearTokenGroupHighlight();
};

var moveTokenHighlightLeft = function() {
  var selectedEl = tokensEl.find('div.selected');

  // NOTE: should never happen
  if (selectedEl.length !== 1) {
    return;
  }

  var prev = selectedEl.prev('div.token-group');
  selectedEl.removeClass('selected');
  if (prev.length === 1) {
    prev.addClass('selected');
  }
  else {
    tokensEl.find('div.token-group').filter(':last')
      .addClass('selected');
  }
};

var moveTokenHighlightRight = function() {
  var selectedEl = tokensEl.find('div.selected');

  // NOTE: should never happen
  if (selectedEl.length !== 1) {
    return;
  }

  var next = selectedEl.next('div.token-group');
  selectedEl.removeClass('selected');
  if (next.length === 1) {
    next.addClass('selected');
  }
  else {
    tokensEl.find('div.token-group').filter(':first')
      .addClass('selected');
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
  return (dropdownEl.find('li.highlighted').length !== 0);
};

// TODO: revisit this and make it better for different font sizes, etc
// http://stackoverflow.com/questions/3392493/adjust-width-of-input-field-to-its-input
var updateInputWidth = function(text) {
  var width = (text.length + 1) * 9;
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
    if (list.cacheAjax === true
        && LOCAL_STORAGE_AVAILABLE === true) {
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

        options.push(expandOptionObject(data[i]));
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

  // filter options with their custom function
  if (typeof list.filterOptions === 'function') {
    options = list.filterOptions(getValue(), list.options, inputValue);
  }
  // else default to mine
  else {
    options = filterOptions(list.options, inputValue);
  }

  // cut options down to maxOptions
  if (typeof list.maxOptions === 'number' &&
      options.length > list.maxOptions) {
    var options2 = [];
    for (var i = 0; i < list.maxOptions; i++) {
      options2.push(options[i]);
    }
    options = options2;
  }

  // add freeform as an option if that's allowed
  if (options.length === 0 && inputValue !== '' &&
      list.allowFreeform === true) {
    options.push(expandOptionObject(inputValue));
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

  // build the options found
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
    // cancel an existing AJAX request
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
  $(this).addClass('selected');
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
  containerEl.on('click', 'div.token-group', clickTokenGroup);

  // catch all clicks on the page
  $('html').on('click', clickPage);

  // catch global keydown
  $(window).on('keydown', keydownWindow);
};

//----------------------------------------------------------
// Public Methods
//----------------------------------------------------------

// returns true if adding the list was successful
// false otherwise
widget.addList = function(name, list) {
  // name must be a string
  if (typeof name !== 'string' || name === '') {
    error(7283, 'The first argument to the addList method must be a non-empty string');
    return false;
  }

  // list must be valid
  if (validListObject(list) !== true) {
    error(2732, 'The list object passed to addList method is not valid.', list);
    return false;
  }

  // add the list
  cfg.lists[name] = expandListObject(list);
  return true;
};

// returns true if adding the option was successful
// false otherwise
widget.addOption = function(listName, option) {
  // TODO: write me
};

widget.blur = function() {
  stopInput();
};

widget.clear = function() {
  clearWidget();
};

widget.config = function(prop, value) {
  // TODO: write me
  // no args, return the current config

  // else set the new prop and value

  // what's the difference between this function and reload?
};

widget.destroy = function() {
  destroyWidget();
};

widget.focus = function() {
  startInput();
};

// return a list object
// returns false if the list does not exist
widget.getList = function(listName) {
  if (listExists(listName) !== true) {
    // NOTE: not throwing error here because it's sufficient to return false
    //       if the list does not exist
    //       Would it be better to throw an error?
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

widget.reload = function(config) {
  // TODO: write me
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

widget.removeList = function(listName) {
  // return false if the list does not exist
  if (listExists(listName) !== true) {
    error(1328, 'Error in removeList method. List "' + listName + '" does not exist.');
    return false;
  }

  // they cannot remove the initialList
  if (listName === cfg.initialList) {
    error(1424, 'Error in removeList method. You cannot remove the initialList "' + listName + '"');
    return false;
  }
  removeList(listName);
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
  // TODO: check Deps here
  if (sanityChecks() !== true) return;
  initConfig();
  initDom();
  addEvents();
  updateTokens();
};
init();

// return the widget
return widget;

}; // end window.AutoComplete
})(); // end anonymous wrapper
