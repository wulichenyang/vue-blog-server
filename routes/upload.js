const router = require('koa-router')()
const UploadController = require('../controllers/upload')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')

// 获取上传七牛云token
router.get('/upload/token', userAuth, UploadController.getUploadToken)
// 删除七牛云图片
router.post('/qiniu/deletePhoto', userAuth, UploadController.deleteFromQiniu)

module.exports = router