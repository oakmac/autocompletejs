var crazyOptions = [
  '&&<<<""">>>>>```////\'\'\'\'\'',
  '<<<<<<',
  '<script' + '>window.alert("evil!");<' + '/' + 'script>',
  {
    optionHTML: '<span class="college">Texas A&amp;M (&copy;)</span>',
    value: 'Texas A&M'
  }
];

var widget = new AutoComplete('search_bar', crazyOptions);