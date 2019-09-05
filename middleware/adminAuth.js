// 管理员用户权限验证中间件
// 使用方法：jwtAuth + adminAuth：需用权限路由前使用中间件
module.exports = async (ctx, next) => {
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
}