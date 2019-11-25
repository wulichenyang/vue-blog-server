const router = require('koa-router')()
const {
  ApiPrefix,
} = require('../config/index')
const user = require('./user')
const category = require('./category')
const post = require('./post')
const upload = require('./upload')
const comment = require('./comment')
const reply = require('./reply')
const like = require('./like')
const follow = require('./follow')
const search = require('./search')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

// 汇总路由
const addRoutes = (rootRouter) => {
  rootRouter.use(ApiPrefix, router.routes(), router.allowedMethods())

  rootRouter.use(ApiPrefix, user.routes(), user.allowedMethods())

  rootRouter.use(ApiPrefix, category.routes(), category.allowedMethods())

  rootRouter.use(ApiPrefix, upload.routes(), upload.allowedMethods())

  rootRouter.use(ApiPrefix, post.routes(), post.allowedMethods())

  rootRouter.use(ApiPrefix, comment.routes(), comment.allowedMethods())

  rootRouter.use(ApiPrefix, reply.routes(), reply.allowedMethods())

  rootRouter.use(ApiPrefix, like.routes(), like.allowedMethods())

  rootRouter.use(ApiPrefix, follow.routes(), follow.allowedMethods())

  rootRouter.use(ApiPrefix, search.routes(), search.allowedMethods())
}

exports.addRoutes = addRoutes