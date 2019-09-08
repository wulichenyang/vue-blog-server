const Koa = require('koa')
const {
  ApiPrefix
} = require('./config/index')
const app = new Koa()
const runDB = require('./mongodb/db')
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const user = require('./routes/user')
const Router = require('koa-router')
// 启动 gzip 压缩
const compress = require('compression')
// 日志记录
const log4js = require('./app/log4js')
// 客户请求限制
const RateLimit = require('koa2-ratelimit').RateLimit;
// 抵御一些比较常见的安全web安全隐患
// https://cnodejs.org/topic/56f3b0e8dd3dade17726fe85
const helmet = require('helmet')



// 限制每个ip，一小时最多1500次请求
const limiter = RateLimit.middleware({
  interval: {
    min: 60
  }, // 60 minutes = 60*60*1000
  max: 1500, // limit each IP to 1500 requests per interval
});

// 启动日志
log4js(app);
// 抵御一些比较常见的安全web安全隐患
app.use(helmet());
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())

// 启动 gzip 压缩
app.use(compress());
app.use(require('koa-static')(__dirname + '/public'))

app.use(limiter);
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// Method time logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// 启动MongoDB
runDB()

// 根路由
const rootRouter = new Router()
rootRouter.use(ApiPrefix, index.routes(), index.allowedMethods())
rootRouter.use(ApiPrefix, user.routes(), user.allowedMethods())

// routes
app.use(rootRouter.routes(), rootRouter.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app