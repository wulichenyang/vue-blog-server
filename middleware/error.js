  /**
   * 捕获 ctx.throw(
   * [status] http错误码,
   * [msg] 异常描述，可选,
   * [properties] 异常携带的参数，可选)
   * 示例：ctx.throw(400, 'name required', { user: user });
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  exports.onError = async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.response.status = err.statusCode || err.status || 500;

      console.error(`Server error: statusCode: ${ctx.response.status}, errorMessage: ${err.message}`);

      ctx.response.body = {
        code: 1,
        message: err.message
      };
    }
  }