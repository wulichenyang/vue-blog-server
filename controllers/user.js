let userModel = require('../models/user')
let phoneModel = require('../models/phone')
let emailModel = require('../models/email')
let To = require('../utils/to')
let {
  internalErrRes,
  successRes
} = require('../utils/response')
const xss = require('xss')
const {
  checkPhone,
  checkNickname,
  checkPwd
} = require('../utils/validate')
const {
  internalErrRes,
  successRes
} = require('../utils/response')

class userController {

  /**
   * 注册总接口
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signUp(ctx, next) {
    const {
      by
    } = ctx.request.query
    // 手机号注册
    if (by === 'phone') {
      await userController.signUpByPhone(ctx, next)
      // 邮箱号注册
    } else if (by === 'email') {
      await userController.signUpByEmail(ctx, next)
    } else {
      internalErrRes({
        ctx,
        err: '无效注册方式'
      })
      return
    }
  }

  /**
   * 登录总接口
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signIn(ctx, next) {
    const {
      by
    } = ctx.request.query
    // 手机号注册
    if (by === 'phone') {
      await userController.signInByPhone(ctx, next)
      // 邮箱号注册
    } else if (by === 'email') {
      await userController.signInByEmail(ctx, next)
    } else {
      internalErrRes({
        ctx,
        err: '无效登录方式'
      })
      return
    }
  }

  /**
   * 手机号注册
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signUpByPhone(ctx, next) {
    let {
      phone,
      nickname,
      password
    } = ctx.request.body
    let err, isOk;

    // 检查手机格式
    [err, isOk] = checkPhone(phone);

    // 格式错误
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 昵称xss过滤
    nickname = xss(nickname, {
      whiteList: {},
      stripIgnoreTag: true,
      onTagAttr: function (tag, name, value, isWhiteAttr) {
        return '';
      }
    });

    // 检查昵称格式
    [err, isOk] = checkNickname(nickname);

    // 格式错误
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 检查密码格式 
    // TODO: 已被前端md5，怎么检测？
    [err, isOk] = checkPwd(password);

    // 格式错误
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 查找手机号是否已注册
    let findPhone;
    [err, findPhone] = await To(phoneModel.fineOne({
      query: {
        phone
      }
    }))

    // 查询错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 手机号已注册
    if (findPhone.length >= 1) {
      internalErrRes({
        ctx,
        err: '该手机号已注册'
      })
      return
    } else { // 手机号可用

      // 检查昵称是否已注册
      let findUser;
      [err, findUser] = await To(userModel.fineOne({
        query: {
          nickname
        }
      }))

      // 查询错误
      if (err) {
        internalErrRes({
          ctx,
          err
        })
        return
      }

      // 昵称已注册
      if (findUser.length >= 1) {
        internalErrRes({
          ctx,
          err: '该昵称已注册'
        })
        return
      } else { // 昵称可用

        // 注册手机号和用户
        // 注册用户
        let savedUser;
        [err, savedUser] = await To(userModel.save({
          data: {
            password,
            nickname,
          }
        }))

        // 注册用户错误
        if (err) {
          internalErrRes({
            ctx,
            err
          })
          return
        }

        // 注册用户成功
        // 注册手机号
        let savedPhone;
        [err, savedPhone] = await To(phoneModel.save({
          data: {
            phone,
            userId: savedUser._id
          }
        }))

        // 注册手机号错误 回滚所有操作
        if (err) {

          // 回滚


          // 返回错误信息
          internalErrRes({
            ctx,
            err
          })
          return
        }

        // 注册手机号成功
        // 返回注册成功信息
        successRes({
          ctx,
          message: '注册成功，请登录'
        })
        return
      }
    }
  }

  /**
   * 邮箱注册
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signUpByEmail(ctx, next) {

  }

  /**
   * 手机号登录
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signInByPhone(ctx, next) {

  }

  /**
   * 邮箱登录
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signInByEmail(ctx, next) {

  }

  /**
   * 用户登出
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async signOut(ctx, next) {

  }

  /**
   * 获取用户自身信息
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async getUserSelf(ctx, next) {

  }

  /**
   * 获取某用户简略信息（包括自己）
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async getOtherUser(ctx, next) {

  }

  /**
   * 更新用户信息
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async updateUserDetail(ctx, next) {
    // 
  }

  /**
   * 重置密码
   * @param ctx
   * @param next
   * @returns {Promise.<void>}
   */
  static async resetPwd(ctx, next) {
  }
}

module.exports = userController;