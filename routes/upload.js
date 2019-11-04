const router = require('koa-router')()
const UploadController = require('../controllers/upload')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')

// 获取上传七牛云token
router.get('/upload/token', userAuth, onError, UploadController.getUploadToken)
// 删除七牛云图片
router.post('/qiniu/deletePhoto', userAuth, onError, UploadController.deleteFromQiniu)

module.exports = router