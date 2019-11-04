let {
  successRes,
} = require('../utils/response');
let {
  mac,
  options,
  bucket,
} = require('../config/qiniu')
const qiniu = require('qiniu')

class UploadController {

  /**
   * 返回qiniu上传凭证token给用户
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getUploadToken(ctx, next) {
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)

    successRes({
      ctx,
      data: uploadToken,
      message: '获取上传qiniu token成功'
    })
    return
  }

  /**
   * 返回qiniu管理对象
   * 
   * @return {Object}
   */
  static getBucketManager() {
    let config = new qiniu.conf.Config();
    //config.useHttpsDomain = true;
    config.zone = qiniu.zone.Zone_z2;

    let bucketManager = new qiniu.rs.BucketManager(mac, config);

    return bucketManager;
  }
  /**
   * 删除七牛云图片
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteFromQiniu(ctx, next) {
    const {
      key
    } = ctx.request.body;

    let bucketManager = UploadController.getBucketManager()
    // 删除图片
    await new Promise((r, f) => {
      bucketManager.delete(bucket, key, function (err, respBody, respInfo) {
        if (err) {
          ctx.throw(500, err);
          f(err)
        } else {
          successRes({
            ctx,
            data: {
              statusCode: respInfo.statusCode,
              respBody
            },
            message: '删除成功'
          })
          r()
        }
      });
    })
  }
}

module.exports = UploadController;