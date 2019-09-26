let commentModel = require('../models/comment');
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const {
  stringXss,
  htmlXss
} = require('../utils/xss')
const {
  checkComment
} = require('../utils/validate');

class CommentController {

  /**
   * 添加评论
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addComment(ctx, next) {

  }

  /**
   * 删除评论
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteComment(ctx, next) {

  }

  /**
   * 查看评论详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getComment(ctx, next) {

  }

  /**
   * 查看某文章下所有评论列表（获取文章时populate？yes，获取comments时populate(reply)）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCommentList(ctx, next) {

  }

  /**
   * 修改评论详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateComment(ctx, next) {

  }

}

module.exports = CommentController;