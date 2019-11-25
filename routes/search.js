const router = require('koa-router')()
const SearchController = require('../controllers/search')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')

// router.prefix('/search')

// 搜索文章、分类、用户
// /search?key=searchKey&userId=xx
router.get('/search', onError, SearchController.searchAll)

module.exports = router