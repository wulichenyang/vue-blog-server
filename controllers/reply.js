let commentModel = require('../models/comment');
let replyModel = require('../models/reply');
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
  checkReply
} = require('../utils/validate');
const {
  userBriefSelect,
} = require('../config/select')

class ReplyController {

  /**
   * 添加回复
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addReply(ctx, next) {
    // commentId
    const commentId = ctx.params.id;
    const from = ctx.userId;
    // 获取添加的comment信息
    const {
      to,
      content,
      state,
    } = ctx.request.body;
    // 检查reply格式
    let err, isOk;
    [err, isOk] = checkReply({
      commentId,
      from,
      to,
      content,
      state
    })

    // 检测错误，返回错误信息
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await replyModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
      return
    }

    // 插入回复
    let newReply;
    [err, newReply] = await To(replyModel.save({
      data: {
        commentId,
        from,
        to,
        content: stringXss(content),
        state
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      replyModel.rollback();
      return
    }

    // 检查comment是否存在
    let findComment;
    [err, findComment] = await To(commentModel.findOne({
      query: {
        _id: commentId
      }
    }))

    // 查找comment错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      replyModel.rollback();
      return
    }

    // 没找到comment
    if (!findComment) {
      internalErrRes({
        ctx,
        err: '评论不存在'
      })
      // 事务回滚
      replyModel.rollback();
      return
    }

    // 找到并且修改评论
    // 更新comment下和replyIds
    let commentRes;
    let newReplys = [
      ...findComment.reply,
      newReply._id
    ];

    [err, commentRes] = await To(commentModel.update({
      query: {
        _id: commentId
      },
      update: {
        reply: newReplys,
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      replyModel.rollback();
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    replyModel.endTransaction()

    // populate 回复的其他信息

    let populateOptions = [{
      path: 'from',
      model: 'User',
      select: userBriefSelect,
    }, {
      path: 'to',
      model: 'User',
      select: userBriefSelect,
    }];

    // populate reply里from和to信息
    let replyDetail;
    [err, replyDetail] = await To(replyModel.populate({
      collections: newReply,
      options: populateOptions
    }))

    // 查找失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 添加成功，返回成功信息
    successRes({
      ctx,
      data: replyDetail,
      message: '回复成功'
    })
    return

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