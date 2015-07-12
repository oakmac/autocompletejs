/*!
 * autocomplete.js v0.3.0
 * http://autocompletejs.com/
 *
 * Copyright 2013 Chris Oakman
 * Released under the MIT license
 * http://autocompletejs.com/license
 *
 * Date: 20 Oct 2013
 */

// start anonymous scope
;(function() {

// http://yuiblog.com/sandbox/yui/3.3.0pr3/api/escape.js.html
var regexEscape = function(str) {
  return (str + '').replace(/[\-#$\^*()+\[\]{}|\\,.?\s]/g, '\\$&');
};

// https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet
var HTML = [
  { 'char': '&', html: '&amp;', charRegex: /&/g, htmlRegex: /&amp;/g },
  { 'char': '<', html: '&lt;', charRegex: /</g, htmlRegex: /&lt;/g },
  { 'char': '>', html: '&gt;', charRegex: />/g, htmlRegex: /&gt;/g },
  { 'char': '"', html: '&quot;', charRegex: /"/g, htmlRegex: /&quot;/g },
  { 'char': "'", html: '&#x27;', charRegex: /'/g, htmlRegex: /&\#x27;/g },
  { 'char': '/', html: '&#x2F;', charRegex: /\//g, htmlRegex: /&\#x2F;/g },
  { 'char': '`', html: '&#x60;', charRegex: /`/g, htmlRegex: /&\#x60;/g }
];

// html escape
var encode = function(str) {
  str = str + '';
  for (var i = 0; i < HTML.length; i++) {
    str = str.replace(HTML[i].charRegex, HTML[i].html);
  }
  return str;
};

// html decode
var decode = function(str) {
  str = str + '';
  for (var i = 0; i < HTML.length; i++) {
    str = str.replace(HTML[i].htmlRegex, HTML[i]['char']);
  }
  return str;
};

window['AutoComplete'] = window['AutoComplete'] ||
  function(containerElOrId, cfg) {
'use strict';

//------------------------------------------------------------------------------
// Module scope variables
//------------------------------------------------------------------------------

var AJAX_BUFFER_LENGTH = 200,
  HTML_SENTINELS = [],
  LOCAL_STORAGE_AVAILABLE = false,
  MINIMUM_JQUERY_VERSION = '1.4.2';

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
var containerEl, dropdownEl, inputEl,
    placeholderEl, tokensEl, inputWidthProxyEl;

// CSS class names
var CSS = {
  ajaxError: 'ajax-error-8fd89',
  ajaxLoading: 'ajax-loading-72914',
  autocompleteContainer: 'autocomplete-container-7a26d',
  childrenIndicator: 'children-indicator-ca540',
  clear: 'clear-53545',
  dropdown: 'dropdown-a3d44',
  firstOption: 'first-option-96d82',
  highlightedOption: 'highlighted-ea4c1',
  input: 'input-8f2fe',
  inputWidthProxy: 'input-width-proxy-1c13e',
  lastOption: 'last-option-c1e64',
  listItem: 'list-item-d13e9',
  noResults: 'no-results-902b5',
  option: 'option-7b59f',
  placeholder: 'placeholder-d722a',
  removeTokenGroup: 'remove-token-group-53474',
  selectedTokenGroup: 'selected-token-group-359b9',
  tokensContainer: 'tokens-6a7a0',
  token: 'token-75233',
  tokenGroup: 'token-group-c7334',
  tokenSeparator: 'token-separator-359b9'
};

// I believe these are all the CSS properties that could effect text width
// in an <input> element
// https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference
var CSS_TEXT_PROPS = [
  'font-family',
  'font-feature-settings',
  'font-kerning',
  'font-language-override',
  'font-size',
  'font-size-adjust',
  'font-stretch',
  'font-style',
  'font-variant',
  'font-variant-ligatures',
  'font-weight',
  'word-spacing',
  'letter-spacing',
  'white-space',
  'word-wrap',
  'word-break',
  'text-align',
  'text-align-last',
  'text-combine-horizontal',
  'text-decoration',
  'text-decoration-color',
  'text-decoration-line',
  'text-decoration-style',
  'text-indent',
  'text-orientation',
  'text-overflow',
  'text-rendering',
  'text-shadow',
  'text-transform',
  'text-underline-position'
];

// stateful
var ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true,
  AJAX_BUFFER_TIMEOUT,
  AJAX_OBJECT = {},
  CURRENT_LIST_NAME = false,
  INPUT_HAS_FOCUS = false,
  OPTIONS_SHOWING = false,
  SESSION_CACHE = {},
  TOKENS = [],
  VISIBLE_OPTIONS = {};

// constructor return object
var widget = {};

//------------------------------------------------------------------------------
// Util Functions
//------------------------------------------------------------------------------

// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
var createId = function() {
  return 'xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx'.replace(/x/g, function(c) {
    var r = Math.random() * 16 | 0;
    return r.toString(16);
  });
};

var deepCopy = function(thing) {
  return JSON.parse(JSON.stringify(thing));
};

// parse a semantic versioning string
var parseSemVer = function(version) {
  var tmp = version.split('.');
  return {
    major: parseInt(tmp[0], 10),
    minor: parseInt(tmp[1], 10),
    patch: parseInt(tmp[2], 10)
  };
};

// returns true if version is >= minimum
var compareSemVer = function(version, minimum) {
  version = parseSemVer(version);
  minimum = parseSemVer(minimum);

  var versionNum = (version.major * 10000 * 10000) +
    (version.minor * 10000) + version.patch;
  var minimumNum = (minimum.major * 10000 * 10000) +
    (minimum.minor * 10000) + minimum.patch;

  return (versionNum >= minimumNum);
};

// copied from modernizr
LOCAL_STORAGE_AVAILABLE = (function() {
  var str = createId();
  try {
    localStorage.setItem(str, str);
    localStorage.removeItem(str);
    return true;
  } catch (e) {
    return false;
  }
})();

var isArray = Array.isArray || function(vArg) {
  return Object.prototype.toString.call(vArg) === '[object Array]';
};

var isObject = $.isPlainObject;

// returns an array of object keys
var keys = function(obj) {
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
    if (obj.hasOwnProperty(i) !== true) continue;

    // convert to string
    var value = obj[i] + '';

    if (htmlEscape === true) {
      value = encode(value);
    }

    str = str.replace(new RegExp('{' + regexEscape(i) + '}', 'g'), value);
  }
  return str;
};

// returns the current time in seconds
var now = function() {
  // NOTE: Date.now() is not supported in IE7 or IE8
  return parseInt(new Date().getTime() / 1000, 10);
};

// TODO: need to break this up into two functions
//       one for storing in localStorage, one for
//       storing in SESSION_CACHE
var storeInCache = function(key, data, duration) {
  data = JSON.stringify(data);
  var expires = 'never';
  if (typeof duration === 'number') {
    expires = now() + duration;
  }

  var localStorageSucceeded = false;
  if (LOCAL_STORAGE_AVAILABLE === true) {
    try {
      localStorage.setItem(key, data);
      localStorage.setItem(key + ' expires', expires);
      localStorageSucceeded = true;
    } catch (e) {
      // do nothing
    }
  }

  if (localStorageSucceeded === false) {
    SESSION_CACHE[key] = data;
    SESSION_CACHE[key + ' expires'] = expires;
  }
};

var isExpired = function(time) {
  if (time === 'never') {
    return false;
  }
  return parseInt(time, 10) <= now();
};

// returns the data or false if it does not exist
// TODO: need to break this up into two functions
//       one for checking localStorage, one for
//       checking SESSION_CACHE
var getFromCache = function(key) {
  var data,
      expireTime,
      expiresKey = key + ' expires',
      localStorageSucceeded = false;

  // try localStorage first
  if (LOCAL_STORAGE_AVAILABLE === true) {
    try {
      data = localStorage.getItem(key);
      expireTime = localStorage.getItem(expiresKey);
      localStorageSucceeded = true;
    } catch (e) {
      // do nothing
    }

    // check the expiration date
    if (localStorageSucceeded === true &&
        isExpired(expireTime) === false &&
        typeof data === 'string') {
      return JSON.parse(data);
    }
    else {
      localStorageSucceeded = false;
    }
  }

  // check the session cache
  if (localStorageSucceeded === false) {
    if (SESSION_CACHE.hasOwnProperty(expiresKey) === true) {
      expireTime = SESSION_CACHE[expiresKey];

      if (SESSION_CACHE.hasOwnProperty(key) === true &&
          isExpired(expireTime) === false &&
          typeof SESSION_CACHE[key] === 'string') {
        return JSON.parse(SESSION_CACHE[key]);
      }
    }
  }

  return false;
};

// create HTML sentinel values
(function() {
  for (var i = 0; i < HTML.length; i++) {
    var id = createId();
    HTML_SENTINELS[i] = {
      sentinel: id,
      sentinelRegex: new RegExp(regexEscape(id), 'g')
    };
  }
})();

//------------------------------------------------------------------------------
// Validation
//------------------------------------------------------------------------------

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

  // else it must be an object with .value and .tokenHTML
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
  // single token is ok
  if (validToken(value) === true) {
    return true;
  }

  // single token group is ok
  if (validTokenGroup(value) === true) {
    return true;
  }

  // else must be an array of token groups
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

var validOptionObject = function(option) {
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
  // string is ok; should be an AJAX url
  if (typeof obj === 'string') {
    return true;
  }

  // if it's an array, should be an array of Option Objects
  // TODO: should I return false here if the Option Objects are invalid
  //       or just skip them and move on?
  if (isArray(obj) === true) {
    for (var i = 0; i < obj.length; i++) {
      if (validOptionObject(obj[i]) !== true) {
        return false;
      }
    }
    return true;
  }

  if (isObject(obj) !== true) {
    return false;
  }

  // TODO: show an error when a value.children is not a valid list option
  // TODO: what else do we need to validate on the List Object?

  return true;
};

var error = function(code, msg, obj) {
  if (cfg.hasOwnProperty('showErrors') !== true ||
      cfg.showErrors === false) {
    return;
  }

  var errorText = 'AutoComplete Error ' + code + ': ' + msg;
  if (cfg.showErrors === 'console' &&
      typeof console === 'object' &&
      typeof console.log === 'function') {
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
  // if containerId is a string, it must be the ID of a DOM node
  if (typeof containerElOrId === 'string') {
    // cannot be empty
    if (containerElOrId === '') {
      window.alert('AutoComplete Error 1037: ' +
        'The first argument to AutoComplete() cannot be an empty string.' +
        '\n\nExiting...');
      return false;
    }

    // make sure the container element exists in the DOM
    var el = document.getElementById(containerElOrId);
    if (! el) {
      window.alert('AutoComplete Error 1002: Element with id "' +
        containerElOrId + '" does not exist in the DOM.' +
        '\n\nExiting...');
      return false;
    }

    // set the containerEl
    containerEl = $(el);
  }

  // else it must be something that becomes a jQuery collection
  // with size 1
  // ie: a single DOM node or jQuery object
  else {
    containerEl = $(containerElOrId);

    if (containerEl.length !== 1) {
      window.alert('AutoComplete Error 1044: The first argument to ' +
        'AutoComplete() must be an ID or a single DOM node.' +
        '\n\nExiting...');
      return false;
    }
  }

  // JSON must exist
  if (! window.JSON ||
      typeof JSON.stringify !== 'function' ||
      typeof JSON.parse !== 'function') {
    window.alert('AutoComplete Error 1003: JSON does not exist. ' +
      'Please include a JSON polyfill.\n\nExiting...');
    return false;
  }

  // check for the correct version of jquery
  if (! (typeof window.$ && $.fn && $.fn.jquery &&
      compareSemVer($.fn.jquery, MINIMUM_JQUERY_VERSION) === true)) {
    window.alert('AutoComplete Error 1004: Unable to find a valid version ' +
      'of jQuery. Please include jQuery ' + MINIMUM_JQUERY_VERSION + ' or ' +
      'higher on the page.\n\nExiting...');
    return false;
  }

  // expand the config
  return expandConfig();
};

//------------------------------------------------------------------------------
// Expand Data Structures / Set Default Options
//------------------------------------------------------------------------------

var expandTokenObject = function(token) {
  if (typeof token === 'string') {
    token = {
      tokenHTML: encode(token),
      value: token
    };
  }

  return token;
};

var expandTokenGroup = function(group) {
  for (var i = 0; i < group.length; i++) {
    group[i] = expandTokenObject(group[i]);
  }
  return group;
};

var expandValue = function(value) {
  // single token
  if (validToken(value) === true) {
    return [[expandTokenObject(value)]];
  }

  // single token group
  if (validTokenGroup(value) === true) {
    return [expandTokenGroup(value)];
  }

  // else it's an array of token groups
  for (var i = 0; i < value.length; i++) {
    value[i] = expandTokenGroup(value[i]);
  }
  return value;
};

// expand a single option object
var expandOptionObject = function(option, parentList) {
  // string or number becomes the value
  if (typeof option === 'string' ||
      typeof option === 'number') {
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
      ajaxOpts: {
        url: list
      }
    };
  }

  // ajaxEnabled
  list.ajaxEnabled = false;
  if (list.hasOwnProperty('ajaxOpts') === true &&
      (typeof list.ajaxOpts === 'function' ||
       isObject(list.ajaxOpts) === true)) {
    list.ajaxEnabled = true;
  }

  // ajaxErrorHTML default
  if (typeof list.ajaxErrorHTML !== 'string' &&
      typeof list.ajaxErrorHTML !== 'function') {
    list.ajaxErrorHTML = 'AJAX Error';
  }

  // ajaxLoadingHTML default
  if (typeof list.ajaxLoadingHTML !== 'string' &&
      typeof list.ajaxLoadingHTML !== 'function') {
    list.ajaxLoadingHTML = 'Searching&hellip;';
  }

  // default for allowFreeform is false
  if (list.allowFreeform !== true) {
    list.allowFreeform = false;
  }

  // default for cacheAjax is false
  if (list.cacheAjax !== true) {
    list.cacheAjax = false;
  }

  // default for cacheAjaxSeconds is 2 weeks
  if (list.cacheAjaxSeconds !== false &&
      typeof list.cacheAjaxSeconds !== 'number') {
    list.cacheAjaxSeconds = 1209600;
  }
  // should be an integer
  if (typeof list.cacheAjaxSeconds === 'number') {
    list.cacheAjaxSeconds = parseInt(list.cacheAjaxSeconds, 10);
  }

  // default for highlightMatches is true
  if (list.highlightMatches !== false) {
    list.highlightMatches = true;
  }

  // noResultsHTML default
  if (typeof list.noResultsHTML !== 'string' &&
      typeof list.noResultsHTML !== 'function') {
    list.noResultsHTML = 'No results found.';
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
      lists: {
        'default': cfg
      }
    };
  }

  // TODO: need to document this
  if (typeof cfg.ajaxBuffer === 'number' && cfg.ajaxBuffer > 0) {
    AJAX_BUFFER_LENGTH = cfg.ajaxBuffer;
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

  /*
  // TODO: add this?
  // onFocus must be a function
  if (typeof cfg.onFocus !== 'function') {
    cfg.onFocus = false;
  }
  */

  // set an initiaValue
  if (cfg.hasOwnProperty('initialValue') === true) {
    // check that the initialValue is valid
    if (validValue(cfg.initialValue) === true) {
      // NOTE: is deepCopy necessary here?
      TOKENS = deepCopy(expandValue(cfg.initialValue));
    }
    // else show an error
    else {
      error(6447, 'Invalid value passed to initialValue.', cfg.initialValue);
    }
  }

  // placeholderHTML
  if (typeof cfg.placeholderHTML !== 'string') {
    cfg.placeholderHTML = '';
  }

  // tokenSeparatorHTML
  if (typeof cfg.tokenSeparatorHTML !== 'string' &&
      typeof cfg.tokenSeparatorHTML !== 'function') {
    cfg.tokenSeparatorHTML = ':';
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
      error(2642, 'You cannot use an empty string for a list name.');
      delete cfg.lists[i];
      continue;
    }

    // make sure the list is valid
    if (validListObject(cfg.lists[i]) === true) {
      cfg.lists[i] = expandListObject(cfg.lists[i]);
    }
    else {
      error(2535, 'The list object for list "' + i + '" is invalid.',
        cfg.lists[i]);
      delete cfg.lists[i];
    }
  }

  // initialList
  var listNames = keys(cfg.lists);

  // throw an error if they did not specify any lists
  // NOTE: this is more of a sanityCheck() thing, but we need to expand
  //       the rest of the config before we can check this
  if (listNames.length === 0) {
    window.alert('AutoComplete Error 1005: ' +
      'You must include at least one List Object on lists.\n\nExiting...');
    return false;
  }

  if (listNames.length === 1) {
    cfg.initialList = listNames[0];
  }

  if (listExists(cfg.initialList) !== true) {
    error(2728, 'initialList "' + cfg.initialList + '" does not exist ' +
      'on the lists object.');

    // set initialList to the first list in lists
    cfg.initialList = listNames[0];
  }

  // initialize the current list
  CURRENT_LIST_NAME = cfg.initialList;

  return true;
};

//------------------------------------------------------------------------------
// Markup Building Functions
//------------------------------------------------------------------------------

var buildWidget = function() {
  var html = '<div class="' + CSS.autocompleteContainer + '">' +
    '<div class="' + CSS.placeholder + '"></div>' +
    '<div class="' + CSS.tokensContainer + '"></div>' +
    '<input type="text" class="' + CSS.input + '" />' +
    '<div class="' + CSS.clear + '"></div>' +
    '<ul class="' + CSS.dropdown + '" style="display:none"></ul>' +
  '</div>' +
  '<span class="' + CSS.inputWidthProxy + '" style="position:absolute; ' +
  'top:-9999px;"></span>';

  return html;
};

var buildOptionHTML = function(option, parentList) {
  // optionHTML on the option object
  if (typeof option.optionHTML === 'string') {
    return option.optionHTML;
  }

  // parent list has optionHTML as a string template
  if (typeof parentList.optionHTML === 'string' &&
      isObject(option.value) === true) {
    return tmpl(parentList.optionHTML, option.value, true);
  }

  // parent list has optionHTML as a function
  if (typeof parentList.optionHTML === 'function') {
    var html = parentList.optionHTML(option);
    if (typeof html === 'string') {
      return html;
    }

    // throw error if their optionHTML function did not return a string
    error(3843, 'optionHTML function did not return a string.', option);
  }

  // value is a string or number
  if (typeof option.value === 'string' ||
      typeof option.value === 'number') {
    return encode(option.value);
  }

  // TODO: list validation should ensure that we never get here

  // last-ditch effort: iterate through option.value and print
  // the first thing that is a string
  if (isObject(option.value) === true) {
    for (var i in option.value) {
      if (option.hasOwnProperty(i) !== true) continue;
      if (typeof option[i] === 'string') {

        error(3193, 'Could not find a valid value for optionHTML. ' +
          'Resorted to using value property "' + i + '"', option);

        return encode(option[i]);
      }
    }
  }

  // NOTE: this should never happen
  error(5783, 'Unable to create HTML string for optionHTML.', option);
  return '<em>unknown option</em>';
};

var buildOption = function(option, parentList) {
  var optionId = createId();
  VISIBLE_OPTIONS[optionId] = option;

  var childrenListName = getChildrenListName(option, parentList);

  var html = '<li class="' + CSS.listItem + ' ' + CSS.option + '" ' +
  'data-option-id="' + encode(optionId) + '">' +
  option.optionHTML;

  // TODO: make this configurable
  if (typeof childrenListName === 'string') {
    html += '<span class="' + CSS.childrenIndicator + '">&#x25B8;</span>';
  }

  html += '</li>';

  return html;
};

var buildOptions = function(options, parentList, appendVisibleOptions) {
  if (appendVisibleOptions !== true) {
    VISIBLE_OPTIONS = {};
  }

  var html = '';
  for (var i = 0, len = options.length; i < len; i++) {
    html += buildOption(options[i], parentList);
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

// TODO: reduce the level of indentation in this function
//       code smell
var buildTokens = function(tokens) {
  var html = '';
  for (var i = 0; i < tokens.length; i++) {
    var tokenGroup = tokens[i];

    html += '<div class="' + CSS.tokenGroup + '"' +
    ' data-token-group-index="' + i + '">' +
    // TODO: make this customizable
    '<span class="' + CSS.removeTokenGroup + '">&times;</span>';

    for (var j = 0; j < tokenGroup.length; j++) {
      html += '<span class="' + CSS.token + '">' +
        tokenGroup[j].tokenHTML + '</span>';

      // show child indicator
      if (j !== tokenGroup.length - 1) {
        html += '<span class="' + CSS.tokenSeparator + '">';
        if (typeof cfg.tokenSeparatorHTML === 'string') {
          html += cfg.tokenSeparatorHTML;
        }
        if (typeof cfg.tokenSeparatorHTML === 'function') {
          var customTokenSeparator =
            cfg.tokenSeparatorHTML(tokenGroup[j], tokenGroup[j + 1]);

          if (typeof customTokenSeparator === 'string') {
            html += customTokenSeparator;
          }
          // throw an error if their tokenSeparator function did not
          // return a string
          else {
            error(7998,
              'Your tokenSeparatorHTML function did not return a string.');
          }
        }
        html += '</span>'; // end span.token-separator
      }
    }
    html += '</div>'; // end div.token-group
  }

  return html;
};

var buildStringOrFunction = function(cssClass, strOrFn, inputValue) {
  var html = '<li class="' + CSS.listItem + ' ' + cssClass + '">';
  var type = typeof strOrFn;
  if (type === 'string') {
    html += strOrFn;
  }
  if (type === 'function') {
    html += strOrFn(inputValue, getValue());

    // TODO: we should throw an error here if their custom function
    //       does not return a string

  }
  html += '</li>';
  return html;
};

var buildNoResults = function(noResultsHTML, inputValue) {
  return buildStringOrFunction(CSS.noResults, noResultsHTML, inputValue);
};

var buildLoading = function(ajaxLoadingHTML, inputValue) {
  return buildStringOrFunction(CSS.ajaxLoading, ajaxLoadingHTML, inputValue);
};

//------------------------------------------------------------------------------
// DOM Manipulation
//------------------------------------------------------------------------------

var hidePlaceholder = function() {
  placeholderEl.css('display', 'none');
};

var showPlaceholder = function() {
  placeholderEl.css('display', '');
};

var moveTokenHighlightLeft = function() {
  var selectedEl = tokensEl.find('div.' + CSS.selectedTokenGroup);

  // exit if there is not a selected token
  if (selectedEl.length !== 1) return;

  var prev = selectedEl.prev('div.' + CSS.tokenGroup);
  selectedEl.removeClass(CSS.selectedTokenGroup);
  if (prev.length === 1) {
    prev.addClass(CSS.selectedTokenGroup);
  }
  else {
    tokensEl.find('div.' + CSS.tokenGroup).filter(':last')
      .addClass(CSS.selectedTokenGroup);
  }
};

var moveTokenHighlightRight = function() {
  var selectedEl = tokensEl.find('div.' + CSS.selectedTokenGroup);

  // exit if there is not a selected token
  if (selectedEl.length !== 1) return;

  var next = selectedEl.next('div.' + CSS.tokenGroup);
  selectedEl.removeClass(CSS.selectedTokenGroup);
  if (next.length === 1) {
    next.addClass(CSS.selectedTokenGroup);
  }
  else {
    tokensEl.find('div.' + CSS.tokenGroup).filter(':first')
      .addClass(CSS.selectedTokenGroup);
  }
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

var highlightFirstOption = function() {
  highlightOption(dropdownEl.find('li.' + CSS.option).filter(':first'));
};

var clearTokenGroupHighlight = function() {
  tokensEl.find('div.' + CSS.tokenGroup).
    removeClass(CSS.selectedTokenGroup);
};

var highlightLastTokenGroup = function() {
  tokensEl.find('div.' + CSS.tokenGroup).
    removeClass(CSS.selectedTokenGroup).
    filter(':last').
    addClass(CSS.selectedTokenGroup);
};

var updateTokens = function() {
  var tokenHTML = buildTokens(TOKENS);
  tokensEl.html(tokenHTML);

  // update placeholder
  if (tokenHTML === '' && INPUT_HAS_FOCUS === false) {
    showPlaceholder();
  }
  else {
    hidePlaceholder();
  }
};

// add a class to the first and last option
var markFirstLastOptions = function() {
  var listEls = dropdownEl.find('li');
  listEls.removeClass(CSS.firstOption + ' ' + CSS.lastOption);
  listEls.filter(':first').addClass(CSS.firstOption);
  listEls.filter(':last').addClass(CSS.lastOption);
};

// given some text that is in the input element, determine
// it's width in pixels by using a proxy <span> element with all the same
// CSS font and text properties
var calcTextWidth = function(text) {
  // add the text to the dummy span with some extra characters as a buffer
  // NOTE: "W" seems to be the widest character in most fonts
  inputWidthProxyEl.html(encode(text) + 'WW');

  // copy text-related css properties from the input element to the proxy
  var cssProps = {};
  for (var i = 0, len = CSS_TEXT_PROPS.length; i < len; i++) {
    var cssProp = CSS_TEXT_PROPS[i];
    cssProps[cssProp] = inputEl.css(cssProp);
  }
  inputWidthProxyEl.css(cssProps);

  return parseInt(inputWidthProxyEl.width(), 10);
};

var updateInputWidth = function() {
  var inputText = inputEl.val();
  inputEl.css('width', calcTextWidth(inputText) + 'px');
};

var highlightOption = function(optionEl) {
  // remove highlighted from all values in the list
  dropdownEl.find('li.' + CSS.option).
    removeClass(CSS.highlightedOption);

  // add highlight class to the value clicked
  $(optionEl).addClass(CSS.highlightedOption);
};

var adjustDropdownScroll = function() {
  // find the highlighted option
  var highlightedEl = dropdownEl.find('li.' + CSS.highlightedOption);

  // exit if we did not find one
  if (highlightedEl.length !== 1) return;

  var liTop = highlightedEl.position().top;
  var scrollTop = dropdownEl.scrollTop();

  // if the first option is selected, set scrollTop to it's highest in case
  if (dropdownEl.find('li.' + CSS.option).
        filter(':first').
        hasClass(CSS.highlightedOption) === true) {
    dropdownEl.scrollTop(-1);
    return;
  }

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
    // TODO: look into this
    dropdownEl.scrollTop(scrollTop + liTop + liHeight - ddHeight + 6);
  }
};

//------------------------------------------------------------------------------
// Control Flow / Data Manipulation
//------------------------------------------------------------------------------

var setCurrentList = function(listName) {
  // run the onEnd function for the outgoing list
  // TODO: either document this or remove it
  if (cfg.lists[CURRENT_LIST_NAME].hasOwnProperty('onEnd') === true &&
      typeof cfg.lists[CURRENT_LIST_NAME].onEnd === 'function') {
    cfg.lists[CURRENT_LIST_NAME].onEnd();
  }

  // sanity check: make sure the listName exists
  if (listExists(listName) !== true) {
    listName = cfg.initialList;
  }

  // assign the new list
  CURRENT_LIST_NAME = listName;

  // run the onStart function for the new list
  // TODO: either document this or remove it
  if (cfg.lists[CURRENT_LIST_NAME].hasOwnProperty('onStart') === true &&
      typeof cfg.lists[CURRENT_LIST_NAME].onStart === 'function') {
    cfg.lists[CURRENT_LIST_NAME].onStart();
  }
};

var removeList = function(listName) {
  // if they are deleting the current list, reset to the initialList
  if (CURRENT_LIST_NAME === listName) {
    setCurrentList(cfg.initialList);
  }

  // delete the list
  delete cfg.lists[listName];
};

var destroyWidget = function() {
  // remove markup
  containerEl.html('');

  // remove event handlers
  containerEl.unbind();
};

// returns the current value of the widget
var getValue = function() {
  return deepCopy(TOKENS);
};

// set the current value of the widget
var setValue = function(newValue) {
  var oldValue = getValue();

  if (typeof cfg.onChange === 'function') {
    var possibleNewValue = cfg.onChange(newValue, oldValue);

    // only change the value if their onChange function returned a valid value
    if (validValue(possibleNewValue) === true) {
      newValue = possibleNewValue;
    }
    else {
      error(3776, 'Invalid Value returned from your custom onChange function.',
        possibleNewValue);
    }
  }

  // update state
  TOKENS = newValue;
  //ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  //setCurrentList(cfg.initialList);
  updateTokens();
  positionDropdownEl();
};

var listExists = function(listName) {
  return (typeof listName === 'string' &&
          cfg.lists.hasOwnProperty(listName) === true);
};

var showOptions = function(html) {
  positionDropdownEl();
  dropdownEl.css('display', '').html(html);
  OPTIONS_SHOWING = true;
};

var hideOptions = function() {
  dropdownEl.css('display', 'none').html('');

  if (TOKENS.length === 0 &&
      INPUT_HAS_FOCUS === false) {
    showPlaceholder();
  }

  OPTIONS_SHOWING = false;
};

// returns true if a tokenGroup is highlighted
// false otherwise
var isTokenGroupHighlighted = function() {
  return (tokensEl.find('div.' + CSS.selectedTokenGroup).length === 1);
};

var removeTokenGroup = function(tokenGroupIndex) {
  tokenGroupIndex = parseInt(tokenGroupIndex, 10);

  // if we are removing the last token group, then the next token will start
  // a new token group
  if (tokenGroupIndex === (TOKENS.length - 1)) {
    setCurrentList(cfg.initialList);
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  }

  var newTokens = deepCopy(TOKENS);
  newTokens.splice(tokenGroupIndex, 1);
  setValue(newTokens);

  // show the input element if we're under maxTokenGroups
  if (typeof cfg.maxTokenGroups === 'number' &&
      TOKENS.length < cfg.maxTokenGroups) {
    inputEl.css('display', '');
  }
};

var removeHighlightedTokenGroup = function() {
  // do nothing if there are no token groups highlighted
  if (isTokenGroupHighlighted() !== true) return;

  var tokenGroupIndex = parseInt(tokensEl
    .find('div.' + CSS.selectedTokenGroup)
    .attr('data-token-group-index'), 10);

  // make sure the token group index is valid
  if (validTokenGroupIndex(tokenGroupIndex) !== true) {
    clearTokenGroupHighlight();
    return;
  }

  removeTokenGroup(tokenGroupIndex);

  if (INPUT_HAS_FOCUS === true) {
    hideOptions();
    focusInput();
  }
};

var createTokenFromOption = function(option) {
  return {
    tokenHTML: option.tokenHTML,
    value: option.value
  };
};

// returns false if the option has no children
var getChildrenListName = function(option, parentList) {
  if (option.children === false) {
    return false;
  }

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

// TODO: need to separate this function into "getHighlightedOptions"
//       and "addOption(optionObject)", which we can expose to the user
// or maybe it's addToken(optionObject) ?
var addHighlightedOption = function() {
  // get the highlighted value
  var highlightedEl = dropdownEl.find('li.' + CSS.highlightedOption);

  // do nothing if no option is highlighted
  if (highlightedEl.length !== 1) return;

  // get the option object
  var optionId = highlightedEl.attr('data-option-id');

  // close input if we did not find the object
  // NOTE: this should never happen, but it's here for a safeguard
  if (VISIBLE_OPTIONS.hasOwnProperty(optionId) !== true) {
    error(8292, 'Could not find optionID "' + optionId + '".');
    hideOptions();
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
    setCurrentList(childrenListName);
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = false;
  }
  // no children, start a new token group
  else {
    setCurrentList(cfg.initialList);
    ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP = true;
  }

  hideOptions();
  inputEl.val('');

  // have we hit maxTokenGroups?
  if (typeof cfg.maxTokenGroups === 'number' &&
      TOKENS.length >= cfg.maxTokenGroups &&
      ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP === true) {
    // hide the input
    inputEl.css('display', 'none');
  }
  // else start the next token input
  else {
    inputEl.focus();
  }
};

var ajaxSuccess = function(data, list, inputValue, preProcess) {
  // do nothing if they have cancelled autocomplete
  if (INPUT_HAS_FOCUS !== true || OPTIONS_SHOWING !== true) {
    return;
  }

  // run their custom preProcess function
  if (typeof preProcess === 'function') {
    data = preProcess(data, inputValue, getValue());
  }

  // expand the options and make sure they're valid
  var options = [];
  if (isArray(data) === true) {
    for (var i = 0; i < data.length; i++) {
      // skip any objects that are not valid Options
      if (validOptionObject(data[i]) !== true) continue;

      // expand option
      data[i] = expandOptionObject(data[i], list);

      // highlight matching characters
      data[i].optionHTML = highlightMatchChars(data[i].optionHTML, inputValue);

      // add the option
      options.push(data[i]);
    }
  }

  // no results
  var html = '';
  if (options.length === 0 && isOptionShowing() === false) {
    html = buildNoResults(list.noResultsHTML, inputValue);
  }

  // new options
  if (options.length > 0) {
    html = buildOptions(options, list, true);
  }

  // update the dropdown
  dropdownEl.find('li.' + CSS.ajaxLoading).replaceWith(html);
  markFirstLastOptions();

  // highlight the first option if there are no others highlighted
  if (isOptionHighlighted() === false) {
    highlightFirstOption();
  }
};

var ajaxError = function(errType, list, inputValue) {
  // do nothing if they have cancelled autocomplete
  if (INPUT_HAS_FOCUS !== true || OPTIONS_SHOWING !== true) {
    return;
  }

  // ignore aborts, they are handled elsewhere and are expected behavior
  if (errType === 'abort') return;

  var errorMsg = '<li class="' + CSS.listItem + ' ' + CSS.ajaxError + '">';
  if (typeof list.ajaxErrorHTML === 'string') {
    errorMsg += list.ajaxErrorHTML;
  }
  if (typeof list.ajaxErrorHTML === 'function') {
    errorMsg += list.ajaxErrorHTML(errType, inputValue, getValue());
  }
  errorMsg += '</li>';
  dropdownEl.find('li.' + CSS.ajaxLoading).replaceWith(errorMsg);
};

var sendAjaxRequest = function(list, inputValue) {
  // default ajax options
  var ajaxOpts = {
    dataType: 'json',
    preProcess: false,
    type: 'GET'
  };

  // create their ajaxOpts
  var ajaxOpts2 = {};
  if (typeof list.ajaxOpts === 'function') {
    ajaxOpts2 = list.ajaxOpts(inputValue, getValue());
  }
  if (isObject(list.ajaxOpts) === true) {
    ajaxOpts2 = $.extend(true, {}, list.ajaxOpts);
  }

  // expand their url
  if (typeof ajaxOpts2.url === 'string') {
    ajaxOpts2.url = ajaxOpts2.url.replace(/\{input\}/g,
      encodeURIComponent(inputValue));
  }
  if (typeof ajaxOpts2.url === 'function') {
    ajaxOpts2.url = ajaxOpts2.url(inputValue, getValue());
  }

  // do not allow them to override certain ajax options
  var noShotGuy = ['async', 'complete', 'error', 'statusCode', 'success'];
  for (var i = 0; i < noShotGuy.length; i++) {
    // throw an error if they have included an illegal property
    if (ajaxOpts2.hasOwnProperty(noShotGuy[i]) === true) {
      error(1273,
        'You cannot include properties that effect control flow on ajaxOpts: ' +
        '"async", "complete", "error", "statusCode", "success"', noShotGuy[i]);
    }

    delete ajaxOpts[noShotGuy[i]];
  }

  // merge their options with the defaults
  $.extend(ajaxOpts, ajaxOpts2);

  // sanity check: throw an error if url is not a string
  if (typeof ajaxOpts.url !== 'string') {
    error(8721,
      'AJAX url must be a string. Did you forget to include one on ajaxOpts?',
      ajaxOpts.url);
    hideOptions();
    return;
  }

  // create the cache key
  // NOTE: we're only caching GET requests
  //       if I could come up with a way to JSON.stringify and guarantee order
  //       then I think it would make sense to cache other types too
  var cacheKey = false;
  if (ajaxOpts.type.toUpperCase() === 'GET') {
    cacheKey = 'GET ' + ajaxOpts.url;
  }

  // create callbacks
  ajaxOpts.error = function(xhr, errType, exceptionObj) {
    ajaxError(errType, list, inputValue);
  };
  ajaxOpts.success = function(data) {
    // save the result in the cache
    if (list.cacheAjax === true && cacheKey !== false) {
      storeInCache(cacheKey, data, list.cacheAjaxSeconds);
    }

    ajaxSuccess(data, list, inputValue, ajaxOpts.preProcess);
  };

  // check the cache
  if (list.cacheAjax === true && cacheKey !== false) {
    var data = getFromCache(cacheKey);
    if (data !== false) {
      ajaxSuccess(data, list, inputValue, ajaxOpts.preProcess);
      return;
    }
  }

  // send the request after a short timeout
  AJAX_BUFFER_TIMEOUT = window.setTimeout(function() {
    AJAX_OBJECT = $.ajax(ajaxOpts);
  }, AJAX_BUFFER_LENGTH);
};

// returns an array of all characters in str
// with a flag indicating if the character is an HTML character
// NOTE: this is naive; I'm sure there are bugs here
//       also it assumes valid HTML
// TODO: this should handle better when the user has a stray '&'
//       in their HTML that is not escaped
//       that's going to happen often
var findHTMLChars = function(str) {
  var chars = (str + '').split('');
  var result = [];

  var inATag = false;
  var inEscapeSequence = false;
  for (var i = 0; i < chars.length; i++) {
    if (chars[i] === '<') {
      inATag = true;
      result.push({'char': '<', html: true});
      continue;
    }
    if (inATag === true && chars[i] === '>') {
      inATag = false;
      result.push({'char': '>', html: true});
      continue;
    }
    if (chars[i] === '&') {
      inEscapeSequence = true;
      result.push({'char': '&', html: true});
      continue;
    }
    if (inEscapeSequence === true && chars[i] === ';') {
      inEscapeSequence = false;
      result.push({'char': ';', html: true});
      continue;
    }

    if (inATag === true || inEscapeSequence === true) {
      result.push({'char': chars[i], html: true});
      continue;
    }

    result.push({'char': chars[i], html: false});
  }

  return result;
};

// removes all HTML tags and special characters from a string
var removeHTMLChars = function(str) {
  var chars = findHTMLChars(str);
  var str2 = '';
  for (var i = 0; i < chars.length; i++) {
    if (chars[i].html === false) {
      str2 += chars[i]['char'];
    }
  }
  return str2;
};

// add <strong> tags around all characters in optionHTML that exist in input
// ignores all HTML tags and HTML special characters that we don't recognize
var highlightMatchChars = function(optionHTML, input) {
  // create an object of all the characters to be highlighted
  var charsToHighlight = {};
  var inputChars = (input + '').split('');
  for (var i = 0; i < inputChars.length; i++) {
    charsToHighlight[inputChars[i].toLowerCase()] = true;
    charsToHighlight[inputChars[i].toUpperCase()] = true;
  }

  var optionHTMLArr = findHTMLChars(optionHTML);
  var optionHTML2 = '';
  for (var i = 0; i < optionHTMLArr.length; i++) {
    var c = optionHTMLArr[i]['char'];
    var html = optionHTMLArr[i].html;

    // character is not HTML and needs to be highlighted
    if (html === false && charsToHighlight.hasOwnProperty(c) === true) {
      optionHTML2 += '<strong>' + c + '</strong>';
      continue;
    }

    // else just add it to the string
    optionHTML2 += c;
  }

  // do a simple string replace for special HTML characters
  // that need to be highlighted
  for (var i = 0; i < HTML.length; i++) {
    if (charsToHighlight.hasOwnProperty(HTML[i]['char']) !== true) continue;

    optionHTML2 = optionHTML2.replace(HTML[i].htmlRegex,
      '<strong>' + HTML[i].html + '</strong>');
  }

  return optionHTML2;
};

// does input match the beginning of str?
var isFrontMatch = function(input, str) {
  return input.toLowerCase() === str.toLowerCase().substring(0, input.length);
};

// is input a substring inside str?
var isSubstringMatch = function(input, str) {
  return str.toLowerCase().indexOf(input.toLowerCase()) !== -1;
};

// does str contain all of the characters found in input?
var isCharMatch = function(input, str) {
  input = input + '';
  str = str + '';

  if (input === '' || str === '') {
    return false;
  }

  var inputChars = input.split(''),
      inputCharsObj = {},
      i;

  // make a unique array of lower-case input characters
  for (i = 0; i < inputChars.length; i++) {
    inputCharsObj[inputChars[i].toLowerCase()] = true;
  }
  inputChars = keys(inputCharsObj);

  // try to find each one in str
  str = str.toLowerCase();
  for (i = 0; i < inputChars.length; i++) {
    if (str.indexOf(inputChars[i]) === -1) {
      return false;
    }
  }
  return true;
};

// returns an array of options that match against ._matchValue
// also adds a freeform option if that's enabled
var matchOptionsSpecial = function(options, input, list) {
  var i,
      len = options.length,
      options2 = [];

  // do a front match first
  for (i = 0; i < len; i++) {
    if (isFrontMatch(input, options[i]._matchValue) === true) {
      options2.push(options[i]);
      options[i] = false;
    }
  }

  // optionally add the freeform option
  if (list.allowFreeform === true) {
    options2.push(expandOptionObject({
      optionHTML: encode('"' + input + '"'),
      tokenHTML: encode(input),
      value: input
    }, list));
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

// replace HTML special characters with sentinel values
var htmlCharToSentinel = function(str) {
  str = str + '';
  for (var i = 0; i < HTML.length; i++) {
    str = str.replace(HTML[i].htmlRegex, HTML_SENTINELS[i].sentinel);
  }
  return str;
};

// replace sentinel values with HTML special characters
var sentinelToHtmlChar = function(str) {
  str = str + '';
  for (var i = 0; i < HTML.length; i++) {
    str = str.replace(HTML_SENTINELS[i].sentinelRegex, HTML[i].html);
  }
  return str;
};

// takes an HTML string and returns a string of characters that we want
// to match against
// removes HTML tags and HTML special characters that we don't recognize
var findCharsToMatchAgainst = function(str) {
  // convert known HTML special characters to sentinel values
  str = htmlCharToSentinel(str);

  // remove all HTML characters
  str = removeHTMLChars(str);

  // bring back the HTML special characters
  str = sentinelToHtmlChar(str);

  // decode the special chars to regular chars for our search
  str = decode(str);

  // NOTE: the above two steps could be combined to reduce
  //       one less regex loop, but code would be harder to
  //       understand

  return str;
};

var matchOptions = function(input, list) {
  var options = deepCopy(list.options);

  // show all the options if they haven't typed anything
  if (input === '') {
    return options;
  }

  var options2 = [];

  // create ._matchValue
  for (var i = 0; i < options.length; i++) {
    options[i]._matchValue = findCharsToMatchAgainst(options[i].optionHTML);
  }
  options2 = matchOptionsSpecial(options, input, list);

  return options2;
};

// returns true if there is an option showing in the dropdown
var isOptionShowing = function() {
  return (dropdownEl.find('li.' + CSS.option).length > 0);
};

// returns true if an option is highlighted in the dropdown
var isOptionHighlighted = function() {
  return (dropdownEl.find('li.' + CSS.highlightedOption).length !== 0);
};

//------------------------------------------------------------------------------
// Input Keypresses
//------------------------------------------------------------------------------

var pressUpArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.' + CSS.highlightedOption);

  // remove the highlight
  highlightedEl.removeClass(CSS.highlightedOption);

  // get the previous options
  var prevEl = highlightedEl.prevAll('li.' + CSS.option).first();
  if (prevEl.length === 1) {
    prevEl.addClass(CSS.highlightedOption);
  }
  // we are at the top, highlight the last option
  else {
    dropdownEl.find('li.' + CSS.option).last()
      .addClass(CSS.highlightedOption);
  }

  // adjust list scrollbar
  adjustDropdownScroll();
};

var pressDownArrow = function() {
  // get the highlighted element
  var highlightedEl = dropdownEl.find('li.' + CSS.highlightedOption);

  // remove the highlight
  highlightedEl.removeClass(CSS.highlightedOption);

  // get the next option
  var nextEl = highlightedEl.nextAll('li.' + CSS.option).first();
  if (nextEl.length === 1) {
    nextEl.addClass(CSS.highlightedOption);
  }
  // we are at the bottom, highlight the top option
  else {
    dropdownEl.find('li.' + CSS.option).first()
      .addClass(CSS.highlightedOption);
  }

  // adjust list scrollbar
  adjustDropdownScroll();
};

var pressEscapeKey = function() {
  hideOptions();
  clearTokenGroupHighlight();
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

var pressRegularKey = function() {
  // clear the ajax timeout from a previous keystroke
  window.clearTimeout(AJAX_BUFFER_TIMEOUT);

  // cancel any existing AJAX request
  if (AJAX_OBJECT.hasOwnProperty('abort') === true &&
      typeof AJAX_OBJECT.abort === 'function') {
    AJAX_OBJECT.abort();
  }

  // Sometimes it takes this long for a browser reflow to move the
  // input element to the next line.
  // It's safe for this function to be called at any time.
  // Another option would be to poll for this every 50ms or so
  // while input is happening.
  // TODO: Investigate this in the future.
  window.setTimeout(positionDropdownEl, 100);
  window.setTimeout(positionDropdownEl, 200);
  window.setTimeout(positionDropdownEl, 300);

  var inputValue = inputEl.val();

  // remove token group highlight if they are typing
  if (inputValue !== '') {
    clearTokenGroupHighlight();
  }

  // get the current list
  var list = cfg.lists[CURRENT_LIST_NAME];

  // match options with the default algorithm
  var options = matchOptions(inputValue, list);

  // modify the options with their custom function
  if (list.hasOwnProperty('matchOptions') === true &&
      typeof list.matchOptions === 'function') {
    options = list.matchOptions(inputValue, options, deepCopy(list.options),
      getValue());
  }

  // no input, no options, no freeform, and no ajax
  // hide the dropdown and exit
  if (options.length === 0 && inputValue === '' &&
      list.ajaxEnabled === false) {
    hideOptions();
    return;
  }

  // no options found and no AJAX
  // show "No Results" and exit
  if (options.length === 0 && list.ajaxEnabled === false) {
    showOptions(buildNoResults(list.noResultsHTML, inputValue));
    return;
  }

  // highlight matched characters
  if (list.highlightMatches === true) {
    for (var i = 0; i < options.length; i++) {
      options[i].optionHTML =
        highlightMatchChars(options[i].optionHTML, inputValue);
    }
  }

  // build the options
  var html = buildOptions(options, list);

  // add AJAX indicator
  if (list.ajaxEnabled === true) {
    html += buildLoading(list.ajaxLoadingHTML, inputValue);
  }

  // show the options
  showOptions(html);

  // TODO: should these be in showOptions?
  markFirstLastOptions();
  highlightFirstOption();

  // send the AJAX request
  // NOTE: we have to send the AJAX request after we've updated the DOM
  //       because of localStorage caching
  if (list.ajaxEnabled === true) {
    // send the request
    sendAjaxRequest(list, inputValue);
  }
};

//------------------------------------------------------------------------------
// Browser Events
//------------------------------------------------------------------------------

var clickPage = function(e) {
  // stop input if they clicked anywhere outside the container el
  if ($(e.target).parents().index(containerEl) === -1) {
    hideOptions();
  }
};

// click on the container
var clickContainerElement = function() {
  // put the focus on the input element if it doesn't already have it
  if (INPUT_HAS_FOCUS !== true) {
    inputEl.focus();
  }
};

var clickTokenGroup = function(e) {
  // prevent clickContainerEl and clickPage
  e.stopPropagation();

  hideOptions();

  // remove highlight from other token groups
  clearTokenGroupHighlight();

  // highlight this token group
  $(this).addClass(CSS.selectedTokenGroup);
};

var clickRemoveTokenGroup = function(e) {
  // prevent clickContainerEl and clickPage
  e.stopPropagation();

  hideOptions();

  clearTokenGroupHighlight();

  $(this).parents('div.' + CSS.tokenGroup)
    .addClass(CSS.selectedTokenGroup);

  removeHighlightedTokenGroup();
};

// user clicks a dropdown option
var clickOption = function(e) {
  // prevent clickContainerEl and clickPage
  e.stopPropagation();

  // highlight it
  highlightOption(this);

  // add it
  addHighlightedOption();
};

var mouseoverOption = function() {
  highlightOption(this);
};

var focusInput = function() {
  // exit if we are already at maxTokenGroups
  if (typeof cfg.maxTokenGroups === 'number' &&
      TOKENS.length >= cfg.maxTokenGroups &&
      ADD_NEXT_TOKEN_TO_NEW_TOKEN_GROUP === true) {
    return;
  }

  // update state
  INPUT_HAS_FOCUS = true;

  // sanity check / safeguard
  // TODO: is this necessary?
  if (listExists(CURRENT_LIST_NAME) !== true) {
    setCurrentList(cfg.initialList);
  }

  hidePlaceholder();
  clearTokenGroupHighlight();
  positionDropdownEl();

  // simulate keypress
  pressRegularKey();

  // TODO: should this be here?
  adjustDropdownScroll();
};

var blurInput = function() {
  INPUT_HAS_FOCUS = false;

  // add the placeholder if necessary
  if (TOKENS.length === 0 &&
      OPTIONS_SHOWING === false &&
      inputEl.val() === '') {
    showPlaceholder();
  }
};

var keydownInput = function(e) {
  var keyCode = e.which;
  var inputValue = inputEl.val();

  // tabbing on an empty field should not break normal tab behavior
  if (keyCode === KEYS.TAB &&
      inputValue === '') {
    hideOptions();
    return;
  }

  // tabbing on a field with no options showing should
  // act like a normal tab
  if (keyCode === KEYS.TAB && OPTIONS_SHOWING === false) {
    return;
  }

  // enter
  if (keyCode === KEYS.ENTER ||
      keyCode === KEYS.NUMPAD_ENTER) {
    e.preventDefault();
    addHighlightedOption();
    return;
  }

  // tab
  if (keyCode === KEYS.TAB &&
      inputValue !== '') {
    e.preventDefault();
    addHighlightedOption();
    return;
  }

  // backspace on an empty field
  if (keyCode === KEYS.BACKSPACE && inputValue === '') {
    e.preventDefault();
    e.stopPropagation();
    pressBackspaceOnEmptyInput();
    return;
  }

  // left arrow with empty input
  if (keyCode === KEYS.LEFT && inputValue === '') {
    highlightLastTokenGroup();
    return;
  }

  // up arrow
  if (keyCode === KEYS.UP) {
    // prevent the cursor from going to the front of the input element
    e.preventDefault();
    pressUpArrow();
    return;
  }

  // down arrow
  if (keyCode === KEYS.DOWN) {
    // prevent the cursor from going to the end of the input element
    e.preventDefault();
    pressDownArrow();
    return;
  }

  // let left and right arrow events happen naturally inside the input element
  // but don't execute pressRegularKey for them
  if (keyCode === KEYS.LEFT || keyCode === KEYS.RIGHT) {
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
  //       otherwise you're re-writing the logic behind input elements
  window.setTimeout(pressRegularKey, 5);
};

// keydown anywhere on the page
var keydownWindow = function(e) {
  // ignore if input is open or no token groups are highlighted
  if (INPUT_HAS_FOCUS === true ||
      OPTIONS_SHOWING === true ||
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

//------------------------------------------------------------------------------
// Public Methods
//------------------------------------------------------------------------------

// returns true if adding the option was successful
// false otherwise
widget.addOption = function(listName, option) {
  // list name must be valid
  if (validListName(listName) !== true) {
    error(8366,
      'The first argument to the addOption method must be a non-empty string.');
    return false;
  }

  // list must exist
  if (listExists(listName) !== true) {
    error(5732,
      'Error in addOption method. List "' + listName + '" does not exist.');
    return false;
  }

  // option must be valid
  if (validOptionObject(option) !== true) {
    error(7887, 'Invalid option passed to addOption method.', option);
    return false;
  }

  // add the option
  option = expandOptionObject(option, cfg.lists[listName]);
  cfg.lists[listName].options.push(option);
  return true;
};

widget.blur = function() {
  inputEl.blur();
  hideOptions();
};

widget.clear = function() {
  setValue([]);
};

widget.destroy = function() {
  destroyWidget();
};

widget.focus = function(callback) {
  // Add a slight pause to let other events finish, then put the focus
  // on the input field.
  // If we don't do this and the user attaches this function to a button,
  // for example, the page.click event will call hideOptions before
  // the dropdown ever has a chance to show.
  // Another way around this would be for the user to do e.stopPropagation
  // on their event, but that's asking a lot for the programmer and may
  // result in unexpected behavior elsewhere.
  window.setTimeout(function() {
    inputEl.focus();
    if (typeof callback === 'function') {
      callback();
    }
  }, 5);
};

// return a list object
// returns false if the list does not exist
widget.getList = function(name) {
  if (validListName(name) !== true) {
    error(2789,
      'The first argument to the getList method must be a non-empty string.');
    return false;
  }

  // do not throw error if the list does not exist
  // that's normal behavior for this function
  if (listExists(name) !== true) {
    return false;
  }

  return cfg.lists[name];
};

// return all the lists
widget.getLists = function() {
  return cfg.lists;
};

// get the value
widget.getValue = function() {
  return getValue();
};

// alias for widget.getList and widget.setList
widget.list = function(name, list) {
  if (arguments.length === 1) {
    return widget.getList(name);
  }

  if (arguments.length === 2) {
    return widget.setList(name, list);
  }

  error(5938, 'Wrong number of arguments passed to list method.');
  return false;
};

widget.pressDown = function() {
  if (OPTIONS_SHOWING !== true) return;
  pressDownArrow();
};

widget.pressEnter = function() {
  if (OPTIONS_SHOWING !== true) return;
  pressEnterOrTab();
};

widget.pressUp = function() {
  if (OPTIONS_SHOWING !== true) return;
  pressUpArrow();
};

widget.removeList = function(name) {
  // name must be valid
  if (validListName(name) !== true) {
    error(2231,
      'The first argument to the removeList method ' +
      'must be a non-empty string.');
    return false;
  }

  // return false if the list does not exist
  if (listExists(name) !== true) {
    error(1328,
      'Error in removeList method. List "' + name + '" does not exist.');
    return false;
  }

  // they cannot remove the initialList
  if (name === cfg.initialList) {
    error(1424,
      'Error in removeList method. You cannot remove the initialList ' +
      '"' + name + '"');
    return false;
  }

  removeList(name);
  return true;
};

// returns false if the token group index is invalid
// returns the new value of the widget otherwise
widget.removeTokenGroup = function(tokenGroupIndex) {
  if (validTokenGroupIndex(tokenGroupIndex) !== true) {
    error(4823,
      'Error in removeTokenGroup method. ' +
      'Token group index "' + tokenGroupIndex + '" does not exist.');
    return false;
  }

  removeTokenGroup(tokenGroupIndex);
  return getValue();
};

widget.setInput = function(input) {
  if (typeof input !== 'string') {
    error(4922, 'The first argument to the setInput method must be a string.');
    return false;
  }

  inputEl.focus();
  inputEl.val(input);
  pressRegularKey();
  return true;
};

// returns true if updating the list was successful
// false otherwise
widget.setList = function(name, list) {
  // name must be valid
  if (validListName(name) !== true) {
    error(7283,
      'The first argument to the setList method must be a non-empty string.');
    return false;
  }

  // list must be valid
  if (validListObject(list) !== true) {
    error(2732,
      'The list object passed to the setList method is not valid.', list);
    return false;
  }

  // add the list
  cfg.lists[name] = expandListObject(list);
  return true;
};

widget.setValue = function(value) {
  if (validValue(value) !== true) {
    error(6823, 'Invalid value passed to the setValue method.', value);
    return false;
  }
  setValue(expandValue(value));
  return true;
};

// alias for widget.getValue and widget.setValue
widget.val = function(value) {
  if (arguments.length === 0) {
    return widget.getValue();
  }

  if (arguments.length === 1) {
    return widget.setValue(value);
  }

  error(9992, 'Wrong number of arguments passed to val method.');
  return false;
};

//------------------------------------------------------------------------------
// Initialization
//------------------------------------------------------------------------------

var addEvents = function() {
  // NOTE: using delegate and bind here instead of $.on to
  // maintain compatibility with older jquery versions
  containerEl.bind('click', clickContainerElement);
  containerEl.delegate('input.' + CSS.input, 'keydown', keydownInput);
  containerEl.delegate('input.' + CSS.input, 'change keyup', updateInputWidth);
  containerEl.delegate('input.' + CSS.input, 'focus', focusInput);
  containerEl.delegate('input.' + CSS.input, 'blur', blurInput);
  containerEl.delegate('li.' + CSS.option, 'click', clickOption);
  containerEl.delegate('li.' + CSS.option, 'mouseover', mouseoverOption);
  containerEl.delegate('div.' + CSS.tokenGroup, 'click', clickTokenGroup);
  containerEl.delegate('span.' + CSS.removeTokenGroup, 'click',
    clickRemoveTokenGroup);

  // catch all clicks on the page
  $('html').bind('click touchstart', clickPage);

  // catch global keydown
  $(window).bind('keydown', keydownWindow);
};

var initDom = function() {
  // build the markup inside the container
  containerEl.html(buildWidget());

  // grab elements in memory
  inputEl = containerEl.find('input.' + CSS.input);
  dropdownEl = containerEl.find('ul.' + CSS.dropdown);
  placeholderEl = containerEl.find('div.' + CSS.placeholder);
  tokensEl = containerEl.find('div.' + CSS.tokensContainer);
  inputWidthProxyEl = containerEl.find('span.' + CSS.inputWidthProxy);

  // set the placeholder
  placeholderEl.html(cfg.placeholderHTML);
};

var init = function() {
  if (sanityChecks() !== true) return;

  initDom();
  addEvents();
  updateTokens();
};
init();

// return the widget
return widget;

}; // end window.AutoComplete

// expose html encode function
window.AutoComplete.htmlEncode = encode;

})(); // end anonymous wrapper
