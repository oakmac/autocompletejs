var config = {
  initialList: 'states',
  lists: {
    states: {
      url: 'api/states.php',
      preProcess: false
    }
  }
};
var widget = new AutoComplete('example9', config);