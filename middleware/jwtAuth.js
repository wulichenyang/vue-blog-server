let jwt = require('jsonwebtoken')
let {
  privateKey
} = require('../config')

// 登录用户权限验证中间件
// 验证用户 token，取用户 id 放入 ctx
// 使用方法：需用权限路由前使用中间件
module.exports = async (ctx, next) => {

  // 取 Header 里的 token
  let token = ctx.header.authorization && ctx.header.authorization.split('Bearer ')[1]
  // let token = req.get('Authorization') && req.get('Authorization').split('Bearer ')[1] // ||
  // req.body.token ||
  // req.query.token || 
  // req.get('x-access-token')

  // 请求头部 Authorization 字段里未包含 token
  if (!token) {
    ctx.status = 401;
    ctx.body = {
      code: 1,
      message: '未登录'
    }
    return;
  }

  // 验证 token 超时/正确性
  jwt.verify(token, privateKey, (err, decoded) => {

    // token 超时或验证失败
    if (err) {
      ctx.status = 401;
      ctx.body = {
        code: 1,
        message: '登录超时'
      }
      return;
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

      // 跳出中间件，允许访问
      await next();
    }
  });
};