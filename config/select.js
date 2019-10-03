// 用户详细信息，另加phone和email
exports.userDetailSelect = {
  role: 1,
  nickname: 1,
  realname: 1,
  gender: 1,
  birth: 1,
  avatar: 1,
  brief: 1,
  postCount: 1,
  fansCount: 1,
  likeCount: 1,
  followPeopleCount: 1,
  followCategoryCount: 1,
  followPostCount: 1,
  collectPostCount: 1,
}

exports.userBriefSelect = {
  nickname: 1,
  gender: 1,
  avatar: 1,
  brief: 1,
  postCount: 1,
  fansCount: 1,
  followPeopleCount: 1,
  followCategoryCount: 1,
  followPostCount: 1,
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