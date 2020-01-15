let commentModel = require('../models/comment');
let postModel = require('../models/post');
let replyModel = require('../models/reply');
let likeModel = require('../models/like');
let userModel = require('../models/user');

let To = require('../utils/to');
let {
  successRes
} = require('../utils/response');

const {
  checkLike
} = require('../utils/validate');
const {

} = require('../config/select')

const Tx = require('../utils/transaction')

class LikeController {

  /**
   * 添加点赞
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async toggleLike(ctx, next) {
    // 点赞对象类型（post/comment/reply）
    const {
      type
    } = ctx.request.query
    // targetId
    const targetId = ctx.params.id;
    // 获取用户信息
    const userId = ctx.userId;
    // 点赞文本所属用户
    const {
      authorId
    } = ctx.request.body
    // 检查like格式
    let err, isOk;
    [err, isOk] = checkLike({
      type,
      userId,
      targetId,
      authorId,
    })

    // 检测错误，返回错误信息
    if (!isOk) {
      ctx.throw(500, err);
      return
    }

    // 检测赞是否存在，存在则删除
    let findLike;
    [err, findLike] = await To(likeModel.findOne({
      query: {
        userId,
        type,
        targetId,
      }
    }))

    if (err) {
      ctx.throw(500, err);
      return
    }

    // 找到则删除该点赞
    if (findLike) {
      await LikeController.deleteLike(ctx, next, findLike, authorId)
      return
    }

    // 未找到则是添加点赞
    // 开启事务
    let likeTx = new Tx();
    let postTx = new Tx();
    let userTx = new Tx();
    let commentTx = new Tx();
    let replyTx = new Tx();

    let txErr, isTxOk;
    [txErr, isTxOk] = await likeTx.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr);
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

    // 插入点赞
    let newLike;
    [err, newLike] = await To(likeModel.save({
      data: {
        type,
        userId,
        targetId,
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 检查点赞对象是否存在
    let findTarget;
    switch (type) {
      case 'post':
        [err, findTarget] = await To(postModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;
      case 'comment':
        [err, findTarget] = await To(commentModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;
      case 'reply':
        [err, findTarget] = await To(replyModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;

      default:
        // 事务回滚
        likeTx.rollback();
        ctx.throw(500, "点赞类型错误");
        return;
        break;
    }

    if (err) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findTarget) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, '点赞对象不存在');
      return
    }

    // 找到并且修改点赞对象likeCount
    // 更新target下和likeCount
    let targetRes;
    let newLikeCount = findTarget.likeCount + 1;

    switch (type) {
      case 'post':

        // 开启事务
        let postTxErr, isPostTxOk;
        [postTxErr, isPostTxOk] = await postTx.startTransaction()

        // 事务开启冲突
        if (!isPostTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, postTxErr);
          return
        }

        [err, targetRes] = await To(postModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          postTx.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'comment':
        // 开启事务
        let commentTxErr, isCommentTxOk;

        [commentTxErr, isCommentTxOk] = await commentTx.startTransaction()

        // 事务开启冲突
        if (!isCommentTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, commentTxErr);
          return
        }

        [err, targetRes] = await To(commentModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          commentTx.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'reply':

        // 开启事务
        let replyTxErr, isReplyTxOk;

        [replyTxErr, isReplyTxOk] = await replyTx.startTransaction()

        // 事务开启冲突
        if (!isReplyTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, replyTxErr);
          return
        }

        [err, targetRes] = await To(replyModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          replyTx.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      default:
        likeTx.rollback();
        postTx.rollback();
        commentTx.rollback();
        replyTx.rollback();
        ctx.throw(500, "点赞类型错误");
        return;
        break;
    }

    // 检查点赞对象用户是否存在
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: authorId
      }
    }))

    if (err) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findUser) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, '点赞文本所属用户不存在');
      return
    }

    // 找到并且修改点赞文本所属用户的likeCount
    // 更新target下和likeCount
    let userRes;
    let newUserLikeCount = findUser.likeCount + 1;

    [err, userRes] = await To(userModel.update({
      query: {
        _id: authorId
      },
      update: {
        likeCount: newUserLikeCount,
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, err);
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    likeTx.endTransaction()
    userTx.endTransaction()
    postTx.endTransaction();
    commentTx.endTransaction();
    replyTx.endTransaction();
    
    // 添加成功，返回成功信息
    successRes({
      ctx,
      message: '点赞成功'
    })
    return

  }

  /**
   * 删除点赞
   * 
   * @param ctx
   * @param next
   * @param like
   * @param authorId 点赞文本所属用户id
   * @return {Promise.<void>}
   */
  static async deleteLike(ctx, next, like, authorId) {
    // 开启事务
    let txErr, isTxOk;
    let likeTx = new Tx();
    let userTx = new Tx();
    let postTx = new Tx();
    let commentTx = new Tx();
    let replyTx = new Tx();
    
    [txErr, isTxOk] = await likeTx.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr);
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

    // 删除点赞
    let err, deleteRes;
    [err, deleteRes] = await To(likeModel.remove({
      query: {
        _id: like._id
      },
    }))

    // 删除失败，返回错误信息
    if (err) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 检查点赞对象是否存在
    let findTarget;
    switch (like.type) {
      case 'post':
        [err, findTarget] = await To(postModel.findOne({
          query: {
            _id: like.targetId
          }
        }))
        break;
      case 'comment':
        [err, findTarget] = await To(commentModel.findOne({
          query: {
            _id: like.targetId
          }
        }))
        break;
      case 'reply':
        [err, findTarget] = await To(replyModel.findOne({
          query: {
            _id: like.targetId
          }
        }))
        break;

      default:
        // 事务回滚
        likeTx.rollback();
        ctx.throw(500, "点赞类型错误");
        break;
    }

    if (err) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findTarget) {
      // 事务回滚
      likeTx.rollback();
      ctx.throw(500, '点赞对象不存在');
      return
    }

    // 找到并且修改点赞对象likeCount
    // 更新target下和likeCount
    let targetRes;
    let newLikeCount = findTarget.likeCount - 1;

    switch (like.type) {
      case 'post':

        // 开启事务
        let postTxErr, isPostTxOk;

        [postTxErr, isPostTxOk] = await postTx.startTransaction()

        // 事务开启冲突
        if (!isPostTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, postTxErr);
          return
        }

        [err, targetRes] = await To(postModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          postTx.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'comment':
        // 开启事务
        let commentTxErr, isCommentTxOk;

        [commentTxErr, isCommentTxOk] = await commentTx.startTransaction()

        // 事务开启冲突
        if (!isCommentTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, commentTxErr);
          return
        }

        [err, targetRes] = await To(commentModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          commentTx.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'reply':

        // 开启事务
        let replyTxErr, isReplyTxOk;

        [replyTxErr, isReplyTxOk] = await replyTx.startTransaction()

        // 事务开启冲突
        if (!isReplyTxOk) {
          // 事务回滚
          likeTx.rollback();
          // 返回错误信息
          ctx.throw(500, replyTxErr);
          return
        }

        [err, targetRes] = await To(replyModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          likeTx.rollback();
          replyTx.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      default:
        likeTx.rollback();
        postTx.rollback();
        commentTx.rollback();
        replyTx.rollback();
        ctx.throw(500, "点赞类型错误");
        return;
        break;
    }

    // 检查点赞对象用户是否存在
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: authorId
      }
    }))

    if (err) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findUser) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, '点赞文本所属用户不存在');
      return
    }

    // 找到并且修改点赞文本所属用户的likeCount
    // 更新target下和likeCount
    let userRes;
    let newUserLikeCount = findUser.likeCount - 1;

    [err, userRes] = await To(userModel.update({
      query: {
        _id: authorId
      },
      update: {
        likeCount: newUserLikeCount,
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      // 事务回滚
      likeTx.rollback();
      userTx.rollback();
      postTx.rollback();
      commentTx.rollback();
      replyTx.rollback();
      ctx.throw(500, err);
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    likeTx.endTransaction()
    userTx.endTransaction()
    postTx.endTransaction();
    commentTx.endTransaction();
    replyTx.endTransaction();

    successRes({
      ctx,
      message: '删除点赞成功'
    })
    return
  }

  // /**
  //  * 查看点赞详细信息
  //  * 
  //  * @param ctx
  //  * @param next
  //  * @return {Promise.<void>}
  //  */
  // static async getLike(ctx, next) {

  // }

  // /**
  //  * （暂时不需要）在获取评论时对每个评论使用，查看某评论下的点赞列表
  //  * 
  //  * @param ctx
  //  * @param next
  //  * @param {string[]} likeIds 该评论下的点赞ids
  //  * @return {Promise.<void>}
  //  */
  // static async getLikeList(ctx, next, likeIds) {

  // }

  /**
   * 修改点赞详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateLike(ctx, next) {

  }

}

module.exports = LikeController;