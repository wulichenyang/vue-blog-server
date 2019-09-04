let phoneModel = require('../models/phone')
let userModel = require('../models/user')
let To = require('../utils/to')
let { internalErrRes, successRes } = require('../utils/response')

// TODO
const checkPhone = (phone) => {
  // if(err){
  //   return ['err info', false]
  // }
  return ['', true]
}
// TODO
const checkPwd = (pwd) => {
  // if(err){
  //   return ['err info', false]
  // }
  return ['', true]
}

class phoneController {
  /**
   * 手机注册
   * @param ctx
   * @returns {Promise.<void>}
   */
  static async signUpByPhone(ctx, next) {
    let { phone, password } = ctx.request.body
    // 检查手机格式
    let err, isOk;
    [err, isOk] = checkPhone(phone);
    // 格式错误
    if (!isOk) {
      internalErrRes({ ctx, err })
    }
    // 检查密码格式
    [err, isOk] = checkPhone(phone);
    // 格式错误
    if (!isOk) {
      internalErrRes({ ctx, err })
    }
    let data;
    // 查找手机号是否已注册
    [err, data] = await To(phoneModel.fineOne({
      query: {
        phone
      }
    }))
    // 查询错误
    if (err) {
      internalErrRes({ ctx, err })
    }
    // 手机号已注册
    if (data.length >= 1) {
      internalErrRes({ ctx, err: '该手机号已注册' })
    } else {
      // 注册手机号和用户
      [err, data] = await To(userModel.save({
        data: {
          password,
          // TODO:
          nickname: uuid(),
        }
      }))
      // 注册用户错误
      if (err) {
        internalErrRes({ ctx, err })
      }
      if(data.length > 0) {

      }
    }
  }
}

module.exports = phoneController;