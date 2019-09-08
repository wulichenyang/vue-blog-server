const router = require('koa-router')()
const ReplyController = require('../controllers/reply')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/replies')

// 添加回复
router.post('/comments/:id/replies', userAuth, ReplyController.addReply)

// 删除回复（检查是否属于本人回复）
router.delete('/replies/:id', userAuth, ReplyController.deleteReply)

// （可选）获取回复详细信息（用户编辑时使用）
router.get('/replies/:id', ReplyController.getReply)

// // （暂时不需要该路由）获取某评论下的所有回复列表（在CommentController里getCommentList()函数内手动根据每个comment的reply（ids）执行getReplyList()）
// router.get('/comments/:id/replies', ReplyController.getReplyList)

// 更新回复（检验是否属于本人回复）
router.put('/replies/:id', userAuth, ReplyController.updateReply)

module.exports = router