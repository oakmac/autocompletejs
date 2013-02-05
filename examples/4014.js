var config = {
  lists: {
    fruits: {
      allowFreeform: true,
      options: ['Apple','Banana','Orange']
    }
  }
};
var widget = new AutoComplete('search_bar', config);