const jwt = require('jsonwebtoken')
const {
  privateKey
} = require('../config')

/**
 * 验证用户 token，取用户 id 放入 ctx
 * 
 * @param ctx
 * @param {function(boolean, number?, string?)} callback
 * @return {Function}
 */
const verifyToken = (ctx, callback) => {
  // 取 Header 里的 token
  let token = ctx.header.authorization && ctx.header.authorization.split('Bearer ')[1]
  // let token = req.get('Authorization') && req.get('Authorization').split('Bearer ')[1] // ||
  // req.body.token ||
  // req.query.token || 
  // req.get('x-access-token')

  // 请求头部 Authorization 字段里未包含 token
  if (!token) {
    // ctx.status = 401;
    // ctx.body = {
    //   code: 1,
    //   message: '未登录'
    // }
    return callback(false, 401, '未登录');
  }

  // 验证 token 超时/正确性
  jwt.verify(token, privateKey, (err, decoded) => {

    // token 超时或验证失败

    if (err) {
      // ctx.status = 401;
      // ctx.body = {
      //   code: 1,
      //   message: '登录超时'
      // }
      return callback(false, 401, '登录超时');
    } else { // jwt 验证成功

      // 保存 token 里 username 信息
      ctx.email = decoded.email
      ctx.phone = decoded.phone
      ctx.userId = decoded.userId
      ctx.role = decoded.role

      // token 验证成功 刷新 token 并返回给前端
      // let newToken = jwt.sign({ username: decoded.username }, "secretOrPrivateKey", {
      //   expiresIn: 60 * 60 * 0.5  // 0.0.2小时过期
      // })

      // // 跳出中间件，允许访问
      // await next();
      return callback(true)
    }
  });
}

/**
 * 登录用户权限验证中间件
 * 使用方法：需用普通用户登录权限路由前使用中间件
 * 
 * @param ctx
 * @param next
 * @return {Promise.<void>}
 */
exports.userAuth = async (ctx, next) => {
  verifyToken(ctx, (isOk, status, message) => {

    // token 验证成功
    if (isOk) {
      await next()
    } else if (!isOk) {

      // token 验证失败
      ctx.status = status;
      ctx.body = {
        code: 1,
        message
      }
      return
    }
  })
};

/**
 * 管理员用户权限验证中间件
 * 使用方法：需用管理员登录权限路由前使用中间件
 * 
 * @param ctx
 * @param next
 * @return {Promise.<void>}
 */
exports.adminAuth = async (ctx, next) => {
  verifyToken(ctx, (isOk, status, message) => {

    // token 验证成功
    if (isOk) {

      // 验证角色类型
      if (ctx.role && ctx.role === 'admin') {
        // 具有 admin 权限
        await next()
      } else {
        // 不是 admin，没有权限，返回错误信息
        ctx.status = 403
        ctx.body = {
          code: 1,
          message: '没有访问权限'
        }
        return
      }
    } else if (!isOk) {

      // token 验证失败
      ctx.status = status;
      ctx.body = {
        code: 1,
        message
      }
      return;
    }
  })
}