const router = require('koa-router')()
const UserController = require('../controllers/user')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/user')

// 用户注册/登录之前获取公钥
// 用于node-rsa 给密码加密
router.get('/publicKey', UserController.genRSAKey)

// 用户注册
// 1. /signup?by=email
// 2. /signup?by=phone
router.post('/signup', UserController.signUp)

// 用户登录
// 1. /signin?by=email
// 2. /signin?by=phone
router.post('/signin', UserController.signIn)

// 用户退出
router.get('/signout', userAuth, UserController.signOut)

// 获取注册用户列表 TODO:
router.get('/admin/users', adminAuth, UserController.getUserList)

// 获取某用户简略信息
router.get('/users/:id', UserController.getUserBrief)

// 获取某用户详细信息
router.get('/admin/users/detail/:id', adminAuth, UserController.getUserDetail)

// 获取用户自身详细信息
router.get('/userself', userAuth, UserController.getUserSelf)

// 删除用户 TODO:
router.delete('/admin/users/:id', adminAuth, UserController.deleteUser)

// 更改用户自身详细信息
router.put('/userself', userAuth, UserController.updateUserSelf)

// 重置密码 TODO:
router.put('/resetPwd', userAuth, UserController.resetPwd)

module.exports = router