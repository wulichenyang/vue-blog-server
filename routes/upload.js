const router = require('koa-router')()
const UploadController = require('../controllers/upload')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')

// 获取上传七牛云token
router.get('/upload/token', UploadController.getUploadToken)

module.exports = router