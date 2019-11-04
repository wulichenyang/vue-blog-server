const router = require('koa-router')()
const PostController = require('../controllers/post')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')

// router.prefix('/post')

// 添加文章
router.post('/categories/:id/posts', userAuth, onError, PostController.addPost)

// 删除文章（需检验是否是属于本人的文章）
router.delete('/posts/:id', userAuth, onError, PostController.deletePost)

// 获取文章详细信息（只返回文章信息，不返回评论信息）
// /posts/:id?userId=
router.get('/posts/:id', onError, PostController.getPost)

// 获取所有文章列表（文章汇总）
router.get('/posts', onError, PostController.getPostList)

// 获取某分类下的文章列表
// /categories/:id/posts?userId=
router.get('/categories/:id/posts', onError, PostController.getPostListByCategory)

// 获取某用户的发表文章列表
router.get('/users/:id/posts', onError, PostController.getPostListByUser)

// 获取用户自身的关注文章列表
router.get('/posts?type=follow', userAuth, onError, PostController.getSelfFollowPostList)

// 获取用户自身的收藏文章列表
router.get('/posts?type=collect', userAuth, onError, PostController.getSelfCollectPostList)

// 更新文章（需检验是否是属于本人的文章）
router.put('/posts/:id', userAuth, onError, PostController.updatePost)

// 文章阅读数 + 1
// router.put('/posts/:id/addViewCount', onError, PostController.addViewCount)

module.exports = router