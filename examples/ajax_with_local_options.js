var config = {
  initialList: 'states',
  lists: {
    'states': {
	  ajaxEnabled: true,
	  url: 'api/states.php?q={value}',
	  options: ['AAA','BBB','CCC']
	}
  }
};
var widget = new AutoComplete('example28372', config);