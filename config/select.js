// 用户详细信息，另加phone和email
exports.userDetailSelect = {
  _id: 1,
  role: 1,
  nickname: 1,
  realname: 1,
  gender: 1,
  birth: 1,
  avatar: 1,
  brief: 1,
  postCount: 1,
  commentCount: 1,
  fansCount: 1,
  likeCount: 1,
  followPeopleCount: 1,
  followCategoryCount: 1,
  followPostCount: 1,
  collectPostCount: 1,
}

exports.otherUserDetailSelect = {
  _id: 1,
  nickname: 1,
  gender: 1,
  avatar: 1,
  brief: 1,

  // 数量
  postCount: 1,
  commentCount: 1,
  fansCount: 1,
  likeCount: 1,

  // 关注
  followPeopleCount: 1,
  followCategoryCount: 1,
  followPostCount: 1,

  // 收藏
  collectPostCount: 1,
}

const postBriefSelect = {
  _id: 1,
  author: 1,
  category: 1,
  title: 1,
  viewCount: 1,
  likeCount: 1,
  commentCount: 1,
  createdAt: 1,
  updatedAt: 1
}

exports.postBriefSelect = postBriefSelect

exports.postDetailSelect = {
  ...postBriefSelect,
  content: 1,
  followCount: 1,
  comment: 1,
  state: 1,
}

exports.userBriefSelect = {
  '_id': 1,
  'avatar': 1,
  'nickname': 1,
}

exports.fansFollowSelect = {
  '_id': 1,
  'userId': 1,
}

exports.userFansSelect = {
  '_id': 1,
  'avatar': 1,
  'nickname': 1,
  'brief': 1,
}

exports.categoryBriefSelect = {
  '_id': 1,
  'name': 1
}

const userCommentSelect = {
  _id: 1,
  postId: 1,
  author: 1,
  content: 1,
  likeCount: 1,
  state: 1,
  createdAt: 1,
  updatedAt: 1,
}

exports.userCommentSelect = userCommentSelect;

exports.postInfoInCommentSelect = {
  _id: 1,
  title: 1,
}

exports.commentDetailSelect = {
  ...userCommentSelect,
  reply: 1,
}

exports.replyDetailSelect = {
  _id: 1,
  commentId: 1,
  from: 1,
  to: 1,
  content: 1,
  likeCount: 1,
  reply: 1,
  state: 1,
  createdAt: 1,
  updatedAt: 1
}