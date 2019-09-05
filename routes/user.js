const router = require('koa-router')()
const UserController = require('../controllers/user')
const userSelfAuth = require('../middleware/userAuth')
const jwtAuth  = require('../middleware/jwtAuth')
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
router.get('/signout', jwtAuth, UserController.signOut)

// 获取用户自身设置信息
router.get('/userself', jwtAuth, UserController.getUserSelf)

// 获取某用户信息
router.get('/users/:id', UserController.getOtherUser)

// 更改用户信息
router.put('/users/:id', jwtAuth, UserController.updateUserDetail)

// 重置密码
router.put('/resetPwd', jwtAuth, UserController.resetPwd)

module.exports = router
