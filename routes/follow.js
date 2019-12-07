const router = require('koa-router')()
const FollowController = require('../controllers/follow')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')

// router.prefix('/follow')

// 添加/删除关注对象（文章、分类、用户）
// /follow/:id?type=post
// /follow/:id?type=category
// /follow/:id?type=user
router.post('/follow/:id', userAuth, onError, FollowController.toggleFollow)

// 某用户的所有关注者
// /users/${id}/fans?userId=${loginUserId}
router.get('/users/:id/fans', onError, FollowController.getFansByUser)

// 某用户所有关注的用户
// /users/${id}/follows/users?userId=${loginUserId}
router.get('/users/:id/follows/users', onError, FollowController.getFollowTargetUsersByUser)

// 某用户所有关注的分类
// /users/${id}/follows/categories?userId=${loginUserId}
router.get('/users/:id/follows/categories', onError, FollowController.getFollowTargetCategoryListByUser)

// 某用户所有关注的文章
// /users/${id}/follows/post?userId=${loginUserId}
router.get('/users/:id/follows/posts', onError, FollowController.getFollowTargetPostListByUser)

// // （可选）获取点赞详细信息（用户编辑时使用）
// router.get('/follow/:id', onError, FollowController.getFollow)

module.exports = router