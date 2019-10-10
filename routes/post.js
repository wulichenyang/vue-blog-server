const router = require('koa-router')()
const PostController = require('../controllers/post')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/post')

// 添加文章
router.post('/categories/:id/posts', userAuth, PostController.addPost)

// 删除文章（需检验是否是属于本人的文章）
router.delete('/posts/:id', userAuth, PostController.deletePost)

// 获取文章详细信息（只返回文章信息，不返回评论信息）
router.get('/posts/:id', PostController.getPost)

// 获取所有文章列表（文章汇总）
router.get('/posts', PostController.getPostList)

// 获取某分类下的文章列表
router.get('/categories/:id/posts', PostController.getPostListByCategory)

// 获取某用户的发表文章列表
router.get('/users/:id/posts', PostController.getPostListByUser)

// 获取用户自身的关注文章列表
router.get('/posts?type=follow', userAuth, PostController.getSelfFollowPostList)

// 获取用户自身的收藏文章列表
router.get('/posts?type=collect', userAuth, PostController.getSelfCollectPostList)

// 更新文章（需检验是否是属于本人的文章）
router.put('/posts/:id', userAuth, PostController.updatePost)

// 文章阅读数 + 1
// router.put('/posts/:id/addViewCount', PostController.addViewCount)

module.exports = router