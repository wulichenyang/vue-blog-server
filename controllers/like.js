let commentModel = require('../models/comment');
let postModel = require('../models/post');
let replyModel = require('../models/reply');
let likeModel = require('../models/like');
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');

const {
  checkLike
} = require('../utils/validate');
const {

} = require('../config/select')

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
    // 检查like格式
    let err, isOk;
    [err, isOk] = checkLike({
      type,
      userId,
      targetId,
    })

    // 检测错误，返回错误信息
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
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
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 找到则删除该点赞
    if (findLike) {
      await LikeController.deleteLike(ctx, next, findLike)
      return
    }

    // 未找到则是添加点赞
    // 开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await likeModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
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
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
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
        internalErrRes({
          ctx,
          err: "点赞类型错误"
        })
        return;
        break;
    }

    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // 没找到target
    if (!findTarget) {
      internalErrRes({
        ctx,
        err: '点赞对象不存在'
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // 找到并且修改点赞对象likeCount
    // 更新target下和likeCount
    let targetRes;
    let newLikeCount = findTarget.likeCount + 1;

    switch (type) {
      case 'post':
        [err, targetRes] = await To(postModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;
      case 'comment':
        [err, targetRes] = await To(commentModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;
      case 'reply':
        [err, targetRes] = await To(replyModel.update({
          query: {
            _id: targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;

      default:
        internalErrRes({
          ctx,
          err: "点赞类型错误"
        })
        break;
    }

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    likeModel.endTransaction()

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
   * @param like 一条点赞 TODO: 点赞时对象用户+1
   * @return {Promise.<void>}
   */
  static async deleteLike(ctx, next, like) {
    // 开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await likeModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
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
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
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
        internalErrRes({
          ctx,
          err: "点赞类型错误"
        })
        break;
    }

    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // 没找到target
    if (!findTarget) {
      internalErrRes({
        ctx,
        err: '点赞对象不存在'
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // 找到并且修改点赞对象likeCount
    // 更新target下和likeCount
    let targetRes;
    let newLikeCount = findTarget.likeCount - 1;

    switch (like.type) {
      case 'post':
        [err, targetRes] = await To(postModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;
      case 'comment':
        [err, targetRes] = await To(commentModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;
      case 'reply':
        [err, targetRes] = await To(replyModel.update({
          query: {
            _id: like.targetId
          },
          update: {
            likeCount: newLikeCount,
          }
        }))
        break;

      default:
        internalErrRes({
          ctx,
          err: "点赞类型错误"
        })
        return;
        break;
    }

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      // 事务回滚
      likeModel.rollback();
      return
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    likeModel.endTransaction()

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