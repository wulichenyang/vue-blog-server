const router = require('koa-router')()
const CommentController = require('../controllers/comment')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/comments')

// 添加评论
router.post('/posts/:id/comments', userAuth, CommentController.addComment)

// 删除评论（检查是否属于本人评论）
router.delete('/comments/:id', userAuth, CommentController.deleteComment)

// （可选）获取评论详细信息（用户编辑评论时使用）
router.get('/comments/:id', CommentController.getComment)

// 获取某文章下的所有评论列表（客户端获取post时，单独再获取comments，在getCommentList中populate生成replies）
router.get('/posts/:id/comments', CommentController.getCommentList)

// 获取某用户的所有评论列表
// /users/${userId}/comments?userId=${loginUserId}
router.get('/users/:id/comments', CommentController.getCommentListByUser)


// 更新评论（检验是否属于本人评论）
router.put('/comments/:id', userAuth, CommentController.updateComment)

module.exports = router