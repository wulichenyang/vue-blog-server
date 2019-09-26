let userModel = require('../models/user');
let phoneModel = require('../models/phone');
let emailModel = require('../models/email');
const {
  userDetailSelect,
  userBriefSelect
} = require('../config/select');
let To = require('../utils/to');
const {
  parsePwd,
  encryptPwd,
  genRSAKey
} = require('../utils/rsa');
const {
  stringXss,
} = require('../utils/xss')
const {
  checkPhone,
  checkEmail,
  checkNickname,
  checkPwd,
  checkUserUpdateObj,
} = require('../utils/validate');
const {
  genToken
} = require('../middleware/auth');
const {
  internalErrRes,
  successRes
} = require('../utils/response');

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
    } = ctx.request.body;
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
    nickname = stringXss(nickname);

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
    let parsedPwd = parsePwd(ctx, password);
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
    let encryptedPwd = encryptPwd(parsedPwd);

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
    } = ctx.request.body;
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
    nickname = stringXss(nickname);

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
    let parsedPwd = parsePwd(ctx, password);
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
    let encryptedPwd = encryptPwd(parsedPwd);

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
    const {
      phone,
      password
    } = ctx.request.body

    // 检查手机号格式
    let err, isOk;
    [err, isOk] = checkPhone(phone)

    // 格式错误，返回错误信息
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 查询手机号是否存在
    let findPhone;
    [err, findPhone] = await To(phoneModel.findOne({
      query: {
        phone
      }
    }))

    // 查询出错，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 手机号不存在，返回错误信息
    if (!findPhone) {
      internalErrRes({
        ctx,
        err: '手机号或密码错误'
      })
      return
    }

    // 利用手机中的userId查询用户
    const {
      userId
    } = findPhone
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      },
    }))

    // 查询错误，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 用户不存在，返回错误信息
    if (!findUser) {
      internalErrRes({
        ctx,
        err: '手机号或密码错误'
      })
      return
    }

    // 用私钥解密密码
    let parsedPwd = parsePwd(ctx, password);

    // 检查密码格式？有必要？
    [err, isOk] = checkPwd(parsedPwd)

    // 密码格式错误，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 再次加密后对比数据库中的用户密码
    let encryptedPwd = encryptPwd(parsedPwd);

    // 密码不正确，返回错误信息
    if (encryptedPwd !== findUser.password) {
      internalErrRes({
        ctx,
        err: '手机号或密码错误'
      })
      return
    }

    // 通过验证，利用用户信息生成jwt，30天过期
    let userinfo = {
      userId: findUser._id,
      nickname: findUser.nickname,
      phone: findPhone.phone,
      email: null,
      role: findUser.role
    };
    let token = genToken(userinfo, 30);

    // 返回正确信息和 token 给用户，
    successRes({
      ctx,
      data: {
        token
      },
      message: '登录成功'
    })
    return
  }

  /**
   * 邮箱登录
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signInByEmail(ctx, next) {
    // 获取登录数据
    const {
      email,
      password
    } = ctx.request.body

    // 检查邮箱号格式
    let err, isOk;
    [err, isOk] = checkEmail(email)

    // 格式错误，返回错误信息
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 查询邮箱号是否存在
    let findEmail;
    [err, findEmail] = await To(emailModel.findOne({
      query: {
        email
      }
    }))

    // 查询出错，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 邮箱号不存在，返回错误信息
    if (!findEmail) {
      internalErrRes({
        ctx,
        err: '邮箱号或密码错误'
      })
      return
    }

    // 利用邮箱号中的userId查询用户
    const {
      userId
    } = findEmail
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      },
    }))

    // 查询错误，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 用户不存在，返回错误信息
    if (!findUser) {
      internalErrRes({
        ctx,
        err: '邮箱号或密码错误'
      })
      return
    }

    // 用私钥解密密码
    let parsedPwd = parsePwd(ctx, password);

    // 检查密码格式？有必要？
    [err, isOk] = checkPwd(parsedPwd)

    // 密码格式错误，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 再次加密后对比数据库中的用户密码
    let encryptedPwd = encryptPwd(parsedPwd);

    // 密码不正确，返回错误信息
    if (encryptedPwd !== findUser.password) {
      internalErrRes({
        ctx,
        err: '邮箱号或密码错误'
      })
      return
    }

    // 通过验证，利用用户信息生成jwt，30天过期
    let userinfo = {
      userId: findUser._id,
      nickname: findUser.nickname,
      phone: null,
      email: findEmail.email,
      role: findUser.role
    };
    let token = genToken(userinfo, 30);

    // 返回正确信息和 token 给用户，
    successRes({
      ctx,
      data: {
        token
      },
      message: '登录成功'
    })
    return
  }

  /**
   * 用户登出
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async signOut(ctx, next) {
    ctx.session = null
    ctx.nickname = null
    ctx.email = null
    ctx.phone = null
    ctx.userId = null
    ctx.role = null
    return successRes({
      ctx,
      message: '退出成功'
    })
  }

  /**
   * 获取用户手机
   * 
   * @param ctx
   * @param {ObjectId} userId
   * @return {Promise.<[string, object]>}
   */
  static async getUserPhone(ctx, userId) {
    let err, findPhone;

    // 查找手机
    [err, findPhone] = await To(phoneModel.findOne({
      query: {
        userId
      },
    }))

    // 查找失败
    if (err) {
      return [err, null]
    }

    // 没找到（未绑定）
    if (!findPhone) {
      return ['', null]
    }
    return ['', findPhone]
  }

  /**
   * 获取用户邮箱
   * 
   * @param ctx
   * @param {ObjectId} userId
   * @return {Promise.<[string, object]>}
   */
  static async getUserEmail(ctx, userId) {
    let err, findEmail;

    // 查找邮箱
    [err, findEmail] = await To(emailModel.findOne({
      query: {
        userId
      },
    }))

    // 查找失败
    if (err) {
      return [err, null]
    }

    // 没找到（未绑定）
    if (!findEmail) {
      return ['', null]
    }
    return ['', findEmail]
  }

  /**
   * 获取用户自身详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserSelf(ctx, next) {
    await UserController.getUserById(ctx, next, ctx.userId, userDetailSelect, true)
  }

  /**
   * 获取某用户简略信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserBrief(ctx, next) {
    let {
      id
    } = ctx.params;
    await UserController.getUserById(ctx, next, id, userBriefSelect, false)
  }

  /**
   * 获取某用户详细信息（管理员查看）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUserDetail(ctx, next) {
    let {
      id
    } = ctx.params;
    await UserController.getUserById(ctx, next, id, userDetailSelect, true)
  }

  /**
   * 根据用户Id和select返回用户信息
   * 
   * @param ctx
   * @param next
   * @param {ObjectId} userId
   * @param {object} select 返回属性
   * @param {object} isDetail 是否返回详细信息（包括手机、邮箱）
   * @return {Promise.<void>}
   */
  static async getUserById(ctx, next, userId, select, isDetail) {
    let err, findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      },
      select
    }));

    // 查找错误，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 用户不存在，返回错误信息
    if (!findUser) {
      internalErrRes({
        ctx,
        err: '未找到用户'
      })
      return
    }

    // 返回手机和邮箱信息
    if (isDetail) {

      // 查找phone信息
      let findPhone;
      [err, findPhone] = await UserController.getUserPhone(ctx, userId);

      // 查找错误，返回错误信息
      if (err) {
        internalErrRes({
          ctx,
          err
        })
        return
      }

      // phone 不存在，（未绑定）
      if (!findPhone) {
        findUser.phone = null
      } else {
        // 找到 phone，加入用户信息
        findUser.phone = findPhone.phone
      }

      // 查找email信息
      let findEmail;
      [err, findEmail] = await UserController.getUserEmail(ctx, userId)

      // 查找错误，返回错误信息
      if (err) {
        internalErrRes({
          ctx,
          err
        })
        return
      }

      // email 不存在，（未绑定）
      if (!findEmail) {
        findUser.email = null
      } else {
        // 找到 email，加入用户信息
        findUser.email = findEmail.email
      }
    }

    // 返回用户信息
    successRes({
      ctx,
      data: {
        userinfo: findUser
      },
      message: 'OK'
    })
    return
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
  static async updateUserSelf(ctx, next) {
    // 获取修改信息
    const {
      updateUserinfo
    } = ctx.request.body
    const userId = ctx.userId

    // 更新信息
    await UserController.updateUserDetailById(ctx, next, userId, updateUserinfo)
  }

  /**
   * 其他触发更新用户信息（本人或非本人）
   * 
   * @param ctx
   * @param next
   * @param {ObjectId} userId 用户id
   * @param {object} updateObj 需要修改的键值map
   * @return {Promise.<void>}
   */
  static async updateUserDetailById(ctx, next, userId, updateObj) {
    // 获取修改信息
    let err, isOk;

    // 检查修改信息格式
    [err, isOk] = checkUserUpdateObj(updateObj)
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 格式正确更新相应属性
    let updateRes;
    [err, updateRes] = await To(userModel.update({
      query: {
        _id: userId,
      },
      update: updateObj,
    }))

    // 更新失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    successRes({
      ctx,
      message: '更新用户信息成功'
    })
    return
  }

  /**
   * 重置用户自身密码
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async resetPwd(ctx, next) {

  }

  /**
   * 生成公钥私钥，返回公钥给用户
   * 用户登录、注册时提前将公钥传递给用户，让用户加锁密码
   * 私钥保存在会话中，用户登录、注册时解锁获得真实密码
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async genRSAKey(ctx, next) {
    let publicKey = genRSAKey(ctx);
    successRes({
      ctx,
      data: {
        publicKey
      },
      message: 'OK'
    })
  }
}

module.exports = UserController;