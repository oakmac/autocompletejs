
var opts = {
  initialList: 'states',
  lists: {
    states: {
      url: 'api/states.php',
      preProcess: false
    }
  }
};
var example9 = new AutoComplete('example9', opts);