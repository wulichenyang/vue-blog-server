const router = require('koa-router')()
const UserController = require('../controllers/user')
const {
  userAuth,
  adminAuth
} = require('../middleware/auth')
// router.prefix('/user')

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

// 获取用户自身设置信息
router.get('/userself', userAuth, UserController.getUserSelf)

// 获取某用户信息
router.get('/users/:id', UserController.getOtherUser)

// 更改用户信息
router.put('/users/:id', userAuth, UserController.updateUserDetail)

// 重置密码
router.put('/resetPwd', userAuth, UserController.resetPwd)

module.exports = router