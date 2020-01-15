let commentModel = require('../models/comment');
let userModel = require('../models/user');
let postModel = require('../models/post');
let likeModel = require('../models/like');
let To = require('../utils/to');
let {
  successRes
} = require('../utils/response');
const {
  stringXss,
  htmlXss
} = require('../utils/xss')
const {
  checkComment
} = require('../utils/validate');
const {
  userBriefSelect,
  replyDetailSelect,
  commentDetailSelect,
  userCommentSelect,
  postInfoInCommentSelect
} = require('../config/select')

const Tx = require('../utils/transaction')

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
      ctx.throw(500, err);
      return
    }

    // 开启事务
    let commentTxErr, isTxOk;
    let commentTx = new Tx();
    let userTx = new Tx();

    [commentTxErr, isTxOk] = await commentTx.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, commentTxErr);
      return
    }

    // 开启事务
    let userTxErr, isUserTxOk;
    [userTxErr, isUserTxOk] = await userTx.startTransaction()

    // 事务开启冲突
    if (!isUserTxOk) {

      // 返回错误信息
      ctx.throw(500, userTxErr);
      return
    }

    // 插入评论
    let newComment;
    [err, newComment] = await To(commentModel.save({
      data: {
        postId,
        author,
        content: htmlXss(content),
        state
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      // 事务回滚
      commentTx.rollback();
      ctx.throw(500, err);
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
      // 事务回滚
      commentTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到post
    if (!findPost) {
      // 事务回滚
      commentTx.rollback();
      ctx.throw(500, '文章不存在');
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
      // 事务回滚
      commentTx.rollback();
      ctx.throw(500, err);
      return
    }


    // 检查user是否存在
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: author
      }
    }))

    // 查找user错误
    if (err) {
      // 事务回滚
      commentTx.rollback();
      userTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到user
    if (!findUser) {
      // 事务回滚
      commentTx.rollback();
      userTx.rollback();
      ctx.throw(500, '用户不存在');
      return
    }

    // 找到并且修改用户
    // 更新user下comment数
    let userRes;
    let newUserCommentCount = findUser.commentCount + 1;

    [err, userRes] = await To(userModel.update({
      query: {
        _id: author
      },
      update: {
        commentCount: newUserCommentCount
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      // 事务回滚
      commentTx.rollback();
      userTx.rollback();
      ctx.throw(500, err);
      return
    }


    // TODO：推送消息

    // 关联操作成功，提交事务
    commentTx.endTransaction()
    userTx.endTransaction()

    // populate 评论的其他信息

    let populateOptions = [{
        path: 'author',
        model: 'User',
        select: userBriefSelect,
      },
      // 回复
      {
        path: 'reply',
        model: 'Reply',
        select: replyDetailSelect,
        options: {
          // limit: repliesLimit,
          createdAt: -1
        },
        // Deep populate
        populate: [{
          path: 'from',
          model: 'User',
          select: userBriefSelect,
        }, {
          path: 'to',
          model: 'User',
          select: userBriefSelect,
        }],
      }
    ];


    // populate comment里author和reply信息
    let commentDetail;
    [err, commentDetail] = await To(commentModel.populate({
      collections: newComment,
      options: populateOptions
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 添加成功，返回成功信息
    successRes({
      ctx,
      data: commentDetail,
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
   * 获取某用户的所有评论列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCommentListByUser(ctx, next) {
    // 被查看用户id
    const {
      id
    } = ctx.params;

    // 登录用户id
    const {
      userId
    } = ctx.request.query;

    // 根据userId过滤查找所有的文章列表
    let err, commentListRes;
    [err, commentListRes] = await To(commentModel.find({
      query: {
        author: id
      },
      select: userCommentSelect,
      options: {
        sort: {
          createdAt: -1
        }
      }
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
    }

    // populate Post 数据
    let populateOptions = [{
      path: 'postId',
      model: 'Post',
      select: postInfoInCommentSelect,
    }, {
      path: 'author',
      model: 'User',
      select: userBriefSelect,
    }];

    [err, commentListRes] = await To(commentModel.populate({
      collections: commentListRes,
      options: populateOptions
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 如果登录，对每条comment查找是否点赞
    if (userId) {
      // comments 点赞
      let commentIds = commentListRes.map(comment => comment._id);
      let findCommentLikeArr;

      [err, findCommentLikeArr] = await To(likeModel.find({
        query: {
          userId,
          type: 'comment',
          targetId: {
            "$in": commentIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err);
        return
      }

      let likeCommentMap = {};

      findCommentLikeArr.forEach(like => {
        likeCommentMap[like.targetId] = true
      })

      commentListRes = commentListRes.map(comment => {
        return {
          ...comment,
          ifLike: likeCommentMap[comment._id] ? true : false
        }
      })

    }

    // 查找成功返回数据
    successRes({
      ctx,
      data: commentListRes,
      message: '获取 userCommentList 成功'
    })
    return
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