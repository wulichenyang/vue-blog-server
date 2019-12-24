const router = require('koa-router')()
const UserController = require('../controllers/user')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
const {
  onError
} = require('../middleware/error')
// router.prefix('/user')

// 用户注册/登录之前获取公钥
// 用于node-rsa 给密码加密
router.get('/publicKey', onError, UserController.genRSAKey)

// 用户注册
// 1. /signup?by=email
// 2. /signup?by=phone
router.post('/signup', onError, UserController.signUp)

// 用户登录
// 1. /signin?by=email
// 2. /signin?by=phone
router.post('/signin', onError, UserController.signIn)

// 用户退出
router.get('/signout', userAuth, onError, UserController.signOut)

// 获取注册用户列表 TODO:
router.get('/admin/users', adminAuth, onError, UserController.getUserList)

// 获取某用户简略信息
// /users/:id?fromUser=
router.get('/users/:id', onError, UserController.getOtherUserDetail)

// 获取某用户详细信息
router.get('/admin/users/detail/:id', adminAuth, onError, UserController.getUserDetail)

// 获取用户自身详细信息
router.get('/userself', userAuth, onError, UserController.getUserSelf)

// 更新用户自身设置信息
router.put('/setting', userAuth, onError, UserController.updateUserSelfSetting)

// 删除用户 TODO:
router.delete('/admin/users/:id', adminAuth, onError, UserController.deleteUser)

// 更改用户自身详细信息
router.put('/userself', userAuth, onError, UserController.updateUserSelf)

// 重置密码 TODO:
router.put('/password', userAuth, onError, UserController.resetPwd)

module.exports = router