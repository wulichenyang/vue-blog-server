let commentModel = require('../models/comment');
let postModel = require('../models/post');
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
    // postId
    const postId = ctx.params.id;
    const author = ctx.userId;
    // 获取添加的comment信息
    const {
      content,
      state,
    } = ctx.request.body;
    // 检查comment格式
    let err, isOk;
    [err, isOk] = checkComment({
      postId,
      author,
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
    [txErr, isTxOk] = await commentModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
      return
    }

    // 插入评论
    let newComment;
    [err, newComment] = await To(commentModel.save({
      data: {
        postId,
        author,
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
      commentModel.rollback();
      return
    }

    // 检查post是否存在
    let findPost;
    [err, findPost] = await To(postModel.findOne({
      query: {
        _id: postId
      }
    }))

    // 查找post错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      commentModel.rollback();
      return
    }

    // 没找到post
    if (!findPost) {
      internalErrRes({
        ctx,
        err: '文章不存在'
      })
      // 事务回滚
      commentModel.rollback();
      return
    }

    // 找到并且修改文章
    // 更新post下comment数和commentIds
    let postRes;
    let newCommentCount = findPost.commentCount + 1;
    let newComments = [
      ...findPost.comment,
      newComment._id
    ];

    [err, postRes] = await To(postModel.update({
      query: {
        _id: postId
      },
      update: {
        comment: newComments,
        commentCount: newCommentCount
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      commentModel.rollback();
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    commentModel.endTransaction()

    // 添加成功，返回成功信息
    successRes({
      ctx,
      data: newComment,
      message: '评论成功'
    })
    return

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