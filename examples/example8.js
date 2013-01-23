var opts = {
  initialList: 'year',
  lists: {
	year: 'api/cars/year.php',
    make: 'api/cars/make.php',
	model: 'api/cars/model.php'
  }
};
var example8 = new AutoComplete('example8', opts);