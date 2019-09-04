let emailModel = require('../models/email')
let userModel = require('../models/user')
let To = require('../utils/to')
let { internalErrRes, successRes } = require('../utils/response')

// TODO
const checkEmail = (email) => {
  return true
}

class emailController {
  /**
   * 邮箱注册
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async signUpByEmail(ctx, next) {
    let { email, password } = ctx.request.body
    // 检查邮箱格式
    if (!checkEmail(email)) {
      internalErrRes({ ctx, err: '邮箱格式不正确' })
    }
    // 查找邮箱号是否已注册
    let err, data;
    [err, data] = await To(emailModel.fineOne({
      query: {
        email
      }
    }))
    // 错误
    if (err) {
      internalErrRes({ ctx, err })
    }
    // 邮箱号已注册
    if (data.length >= 1) {

    } else {

    }
  }
}

module.exports = emailController;