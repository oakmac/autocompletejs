var buildSeparator = function(left, right) {
  if (left.value > right.value) {
    return '&gt;';
  }
  if (left.value < right.value) {
    return '&lt;'
  }
  return '=';
};

var nums = [1,2,3,4,5,6,7,8,9,10];

var config = {
  tokenSeparatorHTML: buildSeparator,
  initialList: 'nums1',
  lists: {
    nums1: {
      children: 'nums2',
      options: nums
    },
    nums2: nums
  }
};
var widget = new AutoComplete('search_bar', config);