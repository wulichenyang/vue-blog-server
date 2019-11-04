const router = require('koa-router')()
const LikeController = require('../controllers/like')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')

// router.prefix('/like')

// 添加/删除点赞
// /like/:id?type=post
// /like/:id?type=comment
// /like/:id?type=reply
router.post('/like/:id', userAuth, onError, LikeController.toggleLike)

// // （可选）获取点赞详细信息（用户编辑时使用）
// router.get('/like/:id', onError, LikeController.getLike)

module.exports = router