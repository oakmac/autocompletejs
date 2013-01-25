var config = {
  initialList: 'year',
  lists: {
    year: 'api/cars/year.php',
    make: 'api/cars/make.php',
    model: 'api/cars/model.php'
  }
};
var widget = new AutoComplete('example8', config);