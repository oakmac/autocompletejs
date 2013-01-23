
var opts = {
  initialList: 'states',
  lists: {
    states: {
      url: 'api/states.php',
      preProcess: function
    }
  }
};
var example9 = new AutoComplete('example9', opts);