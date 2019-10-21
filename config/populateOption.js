exports.postBriefPopulateOptions = [{
  path: 'author',
  model: 'User',
  select: {
    '_id': 1,
    'avatar': 1,
    'nickname': 1,
  }
},
{
  path: 'category',
  model: 'Category',
  select: {
    '_id': 1,
    'name': 1
  }
}];

