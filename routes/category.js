const router = require('koa-router')()
const CategoryController = require('../controllers/category')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/categories')

// 添加文章分类
router.post('/admin/categories', adminAuth, CategoryController.addCategory)

// 删除文章分类
router.delete('/admin/categories/:id', adminAuth, CategoryController.deleteCategory)

// 获取文章分类详细信息
router.get('/categories/:id', CategoryController.getCategory)

// 获取所有文章分类列表
router.get('/categories', CategoryController.getCategoryList)

// 获取自身关注的文章分类列表
router.get('/categories?type=follow', userAuth, CategoryController.getFollowCategoryList)

// 更新文章分类
router.put('/admin/categories/:id', adminAuth, CategoryController.updateCategory)

module.exports = router