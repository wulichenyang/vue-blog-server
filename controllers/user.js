let userModel = require('../models/user')
let phoneModel = require('../models/phone')
let emailModel = require('../models/email')
let To = require('../utils/to')
const {
  parsePwd,
  encryptPwd
} = require('../utils/rsa')
const xss = require('xss')
const {
  checkPhone,
  checkEmail,
  checkNickname,
  checkPwd,
} = require('../utils/validate')
const {
  genToken
} = require('../middleware/auth')
const {
  internalErrRes,
  successRes
} = require('../utils/response')

class UserController {

  /**
   * 注册总接口
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signUp(ctx, next) {
    const {
      by
    } = ctx.request.query
    // 手机号注册
    if (by === 'phone') {
      await UserController.signUpByPhone(ctx, next)
      // 邮箱号注册
    } else if (by === 'email') {
      await UserController.signUpByEmail(ctx, next)
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
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signIn(ctx, next) {
    const {
      by
    } = ctx.request.query
    // 手机号注册
    if (by === 'phone') {
      await UserController.signInByPhone(ctx, next)
      // 邮箱号注册
    } else if (by === 'email') {
      await UserController.signInByEmail(ctx, next)
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
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
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


    // 非对称加密，后端利用私钥解密，检测后再加密存储到DB
    let parsedPwd = parsePwd(ctx, password)
    // 检查密码格式 ? TODO:有必要吗？
    [err, isOk] = checkPwd(parsedPwd);

    // 格式错误
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 服务器二次加密密码 
    let encryptedPwd = encryptPwd(parsedPwd)

    // 查找手机号是否已被注册
    let findPhone;
    [err, findPhone] = await To(phoneModel.findOne({
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

    console.log('findPhone', findPhone)
    // 手机号已被注册
    if (findPhone) {
      internalErrRes({
        ctx,
        err: '该手机号已被注册'
      })
      return
    }

    // 手机号可用
    // 检查昵称是否已被注册
    let findUser;
    [err, findUser] = await To(userModel.findOne({
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

    // 昵称已被注册
    if (findUser) {
      internalErrRes({
        ctx,
        err: '该昵称已被注册'
      })
      return
    }

    // 昵称可用
    // 注册手机号和用户
    // 注册用户
    let savedUser;

    // 关联表操作-开启一个事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await userModel.startTransaction();

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
      return
    }

    // 保存用户信息
    [err, savedUser] = await To(userModel.save({
      data: {
        password: encryptedPwd,
        nickname,
      }
    }))

    // 注册用户错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })

      // 事务回滚
      await userModel.rollback();
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

      // 返回错误信息
      internalErrRes({
        ctx,
        err
      })

      // 用户信息保存事务回滚
      await userModel.rollback()
      return
    }

    // 关联操作成功，提交事务
    await userModel.endTransaction()

    // 注册手机号成功
    // 返回注册成功信息
    successRes({
      ctx,
      message: '注册成功，请登录'
    })
    return
  }

  /**
   * 邮箱注册
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signUpByEmail(ctx, next) {
    let {
      email,
      nickname,
      password
    } = ctx.request.body
    let err, isOk;

    // 检查邮箱格式
    [err, isOk] = checkEmail(email);

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

    // 非对称加密，后端利用私钥解密，检测后再加密存储到DB
    let parsedPwd = parsePwd(ctx, password)
    // 检查密码格式 ? TODO:有必要吗？
    [err, isOk] = checkPwd(parsedPwd);

    // 格式错误
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 服务器二次加密密码 
    let encryptedPwd = encryptPwd(parsedPwd)

    // 查找邮箱号是否已被注册
    let findEmail;
    [err, findEmail] = await To(emailModel.findOne({
      query: {
        email
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

    console.log('findEmail', findEmail)
    // 手机号已被注册
    if (findEmail) {
      internalErrRes({
        ctx,
        err: '该邮箱已被注册'
      })
      return
    }

    // 邮箱号可用
    // 检查昵称是否已被注册
    let findUser;
    [err, findUser] = await To(userModel.findOne({
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

    // 昵称已被注册
    if (findUser) {
      internalErrRes({
        ctx,
        err: '该昵称已被注册'
      })
      return
    }

    // 昵称可用
    // 注册手机号和用户
    // 注册用户
    let savedUser;

    // 关联表操作-开启一个事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await userModel.startTransaction();

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
      return
    }

    // 保存用户信息
    [err, savedUser] = await To(userModel.save({
      data: {
        password: encryptedPwd,
        nickname,
      }
    }))

    // 注册用户错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })

      // 事务回滚
      await userModel.rollback();
      return
    }

    // 注册用户成功
    // 注册邮箱号
    let savedEmail;
    [err, savedEmail] = await To(emailModel.save({
      data: {
        email,
        userId: savedUser._id
      }
    }))

    // 注册邮箱号错误 回滚所有操作
    if (err) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err
      })

      // 用户信息保存事务回滚
      await userModel.rollback()
      return
    }

    // 关联操作成功，提交事务
    await userModel.endTransaction()

    // 注册邮箱号成功
    // 返回注册成功信息
    successRes({
      ctx,
      message: '注册成功，请登录'
    })
    return
  }

  /**
   * 手机号登录
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signInByPhone(ctx, next) {
    // 获取登录数据


    // 检查手机号格式


    // 格式错误，返回错误信息


    // 查询手机号是否存在


    // 手机号不存在，返回错误信息


    // 利用手机中的userId查询用户


    // 用户不存在


    // 返回错误信息


    // 用私钥解密密码


    // 检查密码格式？有必要？


    // 密码格式错误，返回错误信息


    // 再次加密后对比数据库中的用户密码


    // 密码不正确，返回错误信息


    // 通过验证，利用用户信息生成jwt


    // 返回正确信息和 token 给用户，

  }

  /**
   * 邮箱登录
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signInByEmail(ctx, next) {

  }

  /**
   * 用户登出
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signOut(ctx, next) {

  }

  /**
   * 获取用户自身详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserSelf(ctx, next) {

  }

  /**
   * 获取某用户简略信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserBrief(ctx, next) {

  }

  /**
   * 获取某用户详细信息（管理员查看）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserDetail(ctx, next) {

  }

  /**
   * 获取注册用户列表（管理员查看）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserList(ctx, next) {
    //
  }

  /**
   * 删除用户（管理员操作）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteUser(ctx, next) {
    //
  }

  /**
   * 更新用户自身信息（用户）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateUserDetail(ctx, next) {
    // 
  }

  /**
   * 重置用户自身密码
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async resetPwd(ctx, next) {}
}

module.exports = UserController;