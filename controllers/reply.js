let replyModel = require('../models/reply');
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const xss = require('xss');
const {
  checkReply
} = require('../utils/validate');

class ReplyController {

  /**
   * 添加回复
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addReply(ctx, next) {

  }

  /**
   * 删除回复
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteReply(ctx, next) {

  }

  /**
   * 查看回复详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getReply(ctx, next) {

  }

  // /**
  //  * （暂时不需要）在获取评论时对每个评论使用，查看某评论下的回复列表
  //  * 
  //  * @param ctx
  //  * @param next
  //  * @param {string[]} replyIds 该评论下的回复ids
  //  * @return {Promise.<void>}
  //  */
  // static async getReplyList(ctx, next, replyIds) {

  // }

  /**
   * 修改回复详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateReply(ctx, next) {

  }

}

module.exports = ReplyController;