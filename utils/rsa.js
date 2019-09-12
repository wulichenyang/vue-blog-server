const NodeRSA = require('node-rsa')
const sha1 = require('sha1');

/**
 * node-rsa 非对称加密，生成公钥私钥的模块
 */


/**
 * 生成公钥私钥：
 * 用户登录、注册时提前将公钥传递给用户，让用户加锁密码
 * 私钥保存在会话中，用户登录、注册时解锁获得真实密码
 * 
 * @param ctx
 * @return {string} - 生成的公钥串
 */
exports.genRSAKey = (ctx) => {
  // 生成512位密钥
  let key = new NodeRSA({
    b: 512
  })

  // 生成私钥
  let privateKey = key.exportKey('pkcs8-private')
  // 生成公钥
  let publicKey = key.exportKey('pkcs8-public')

  // 保存私钥
  ctx.session.privateKey = privateKey

  // 返回公钥给用户
  return publicKey
}

/**
 * 使用私钥解析密码：
 * 用户登录、注册时提前将公钥传递给用户，让用户加锁密码
 * 私钥保存在会话中，用户登录、注册时解锁获得真实密码
 * 
 * @param ctx
 * @param {string} pwd - 用户传输的加密密码
 * @return {string} decryptedPwd - 解密后的密码
 */
exports.parsePwd = (ctx, pwd) => {
  let priKey = ctx.session.privateKey
  let privateKey = new NodeRSA(priKey, 'pkcs8-private')
  let decryptedPwd = privateKey.decrypt(pwd, 'utf8')
  return decryptedPwd
}


// /**
//  * 客户端加密密码
//  * 
//  * @param {string} pwd - 用户密码
//  * @return {string} decryptedPwd - 加密后的密码
//  */
// // pubKey = new NodeRSA(publicKey,'pkcs8-public');
// // var encrypted = pubKey.encrypt(password, 'base64');


/**
 * 服务器解析出的真实密码再二次加密密码，存入数据库
 * 
 * @param {string} pwd - 解密后的密码
 * @return {string} encryptedPwd - 二次加密的密码
 */
exports.encryptPwd = (pwd) => {
  return sha1(pwd)
}