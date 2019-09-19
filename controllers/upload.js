let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const {

} = require('../utils/validate');
let {
  uploadToken
} = require('../config/qiniu')
class UploadController {

  /**
   * 返回qiniu上传token给用户
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUploadToken(ctx, next) {
    successRes({
      ctx,
      data: uploadToken,
      message: '获取上传qiniu token成功'
    })
    return
  }
}

module.exports = UploadController;