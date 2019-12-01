// let Model = require('../models/');
let postModel = require('../models/post');
let categoryModel = require('../models/category');
// let replyModel = require('../models/reply');
let followModel = require('../models/follow');
let userModel = require('../models/user');

let To = require('../utils/to');
let {
  successRes
} = require('../utils/response');

const {
  checkFollow
} = require('../utils/validate');
const {
  fansFollowSelect,
  categoryListFollowSelect,
  userFansSelect,
  userCategoryListSelect,
} = require('../config/select')

class FollowController {

  /**
   * 添加关注
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async toggleFollow(ctx, next) {
    // 关注对象类型（post/category/user）
    const {
      type
    } = ctx.request.query
    // targetId
    const targetId = ctx.params.id;
    // 获取用户信息
    const userId = ctx.userId;

    // // 关注文本所属用户
    // const {
    //   authorId
    // } = ctx.request.body

    // 检查follow格式
    let err, isOk;
    [err, isOk] = checkFollow({
      type,
      userId,
      targetId,
    })

    // 检测错误，返回错误信息
    if (!isOk) {
      ctx.throw(500, err);
      return
    }

    // 检查是否关注自己
    if (type === 'user' && targetId === userId) {
      ctx.throw(500, '用户不能关注自己');
      return
    }

    // 检测关注是否存在，存在则删除
    let findFollow;
    [err, findFollow] = await To(followModel.findOne({
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

    // 找到则删除该关注
    if (findFollow) {
      await FollowController.deleteFollow(ctx, next, findFollow, userId)
      return
    }

    // 未找到则是添加关注
    // 开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await followModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr);
      return
    }

    // 开启事务
    let userTxErr, isUserTxOk;
    [userTxErr, isUserTxOk] = await userModel.startTransaction()

    // 事务开启冲突
    if (!isUserTxOk) {

      // 返回错误信息
      ctx.throw(500, userTxErr);
      return
    }

    // 插入关注
    let newFollow;
    [err, newFollow] = await To(followModel.save({
      data: {
        type,
        userId,
        targetId,
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 检查关注对象是否存在
    let findTarget;
    switch (type) {
      case 'post':
        [err, findTarget] = await To(postModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;
      case 'category':
        [err, findTarget] = await To(categoryModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;
      case 'user':
        [err, findTarget] = await To(userModel.findOne({
          query: {
            _id: targetId
          }
        }))
        break;

      default:
        // 事务回滚
        followModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    if (err) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findTarget) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, '关注对象不存在');
      return
    }

    // 找到并且修改关注对象followCount
    // 更新target下和followCount
    let targetRes;
    let newFollowCount = type === 'user' ? findTarget.fansCount + 1 : findTarget.followCount + 1;

    switch (type) {
      case 'post':

        // 开启事务
        let postTxErr, isPostTxOk;

        [postTxErr, isPostTxOk] = await postModel.startTransaction()

        // 事务开启冲突
        if (!isPostTxOk) {
          // 事务回滚
          followModel.rollback();
          // 返回错误信息
          ctx.throw(500, postTxErr);
          return
        }

        [err, targetRes] = await To(postModel.update({
          query: {
            _id: targetId
          },
          update: {
            followCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          postModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;
      case 'category':
        // 开启事务
        let categoryTxErr, isCategoryTxOk;

        [categoryTxErr, isCategoryTxOk] = await categoryModel.startTransaction()

        // 事务开启冲突
        if (!isCategoryTxOk) {
          // 事务回滚
          followModel.rollback();
          // 返回错误信息
          ctx.throw(500, categoryTxErr);
          return
        }

        [err, targetRes] = await To(categoryModel.update({
          query: {
            _id: targetId
          },
          update: {
            followCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'user':
        [err, targetRes] = await To(userModel.update({
          query: {
            _id: targetId
          },
          update: {
            fansCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;

      default:
        followModel.rollback();
        userModel.rollback();
        postModel.rollback();
        categoryModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    // 检查操作用户是否存在(更新操作用户信息)
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      }
    }))

    if (err) {
      // 事务回滚
      followModel.rollback();
      userModel.rollback();
      postModel.rollback();
      categoryModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findUser) {
      // 事务回滚
      followModel.rollback();
      userModel.rollback();
      postModel.rollback();
      categoryModel.rollback();
      ctx.throw(500, '发起关注的用户不存在');
      return
    }

    // 找到并且修改发起关注所属用户的followXXCount和folowXX
    let userRes;
    let newFollowIds;

    switch (type) {
      case 'post':
        newFollowCount = findUser.followPostCount + 1;
        newFollowIds = [
          ...findUser.followPost,
          targetId
        ];


        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followPost: newFollowIds,
            followPostCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      case 'category':
        newFollowCount = findUser.followCategoryCount + 1;
        newFollowIds = [
          ...findUser.followCategory,
          targetId
        ];

        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followCategory: newFollowIds,
            followCategoryCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;

      case 'user':
        newFollowCount = findUser.followPeopleCount + 1;
        newFollowIds = [
          ...findUser.followPeople,
          targetId
        ];

        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followPeople: newFollowIds,
            followPeopleCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      default:
        followModel.rollback();
        userModel.rollback();
        postModel.rollback();
        categoryModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    followModel.endTransaction()
    userModel.endTransaction()
    postModel.endTransaction();
    categoryModel.endTransaction();

    // 添加成功，返回成功信息
    successRes({
      ctx,
      message: '关注成功'
    })
    return

  }

  /**
   * 删除关注
   * 
   * @param ctx
   * @param next
   * @param follow 关注记录
   * @param userId 关注发起用户id
   * @return {Promise.<void>}
   */
  static async deleteFollow(ctx, next, follow, userId) {
    // 开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await followModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr);
      return
    }

    // 开启事务
    let userTxErr, isUserTxOk;
    [userTxErr, isUserTxOk] = await userModel.startTransaction()

    // 事务开启冲突
    if (!isUserTxOk) {

      // 返回错误信息
      ctx.throw(500, userTxErr);
      return
    }

    // 删除关注
    let err, deleteRes;
    [err, deleteRes] = await To(followModel.remove({
      query: {
        _id: follow._id
      },
    }))

    // 删除失败，返回错误信息
    if (err) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 检查关注对象是否存在
    let findTarget;
    switch (follow.type) {
      case 'post':
        [err, findTarget] = await To(postModel.findOne({
          query: {
            _id: follow.targetId
          }
        }))
        break;
      case 'category':
        [err, findTarget] = await To(categoryModel.findOne({
          query: {
            _id: follow.targetId
          }
        }))
        break;
      case 'user':
        [err, findTarget] = await To(userModel.findOne({
          query: {
            _id: follow.targetId
          }
        }))
        break;
      default:
        // 事务回滚
        followModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    if (err) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findTarget) {
      // 事务回滚
      followModel.rollback();
      ctx.throw(500, '关注对象不存在');
      return
    }

    // 找到并且修改关注对象followCount
    // 更新target下和followCount
    let targetRes;
    let newFollowCount = follow.type === 'user' ? findTarget.fansCount - 1 : findTarget.followCount - 1;

    switch (follow.type) {
      case 'post':

        // 开启事务
        let postTxErr, isPostTxOk;

        [postTxErr, isPostTxOk] = await postModel.startTransaction()

        // 事务开启冲突
        if (!isPostTxOk) {
          // 事务回滚
          followModel.rollback();
          // 返回错误信息
          ctx.throw(500, postTxErr);
          return
        }

        [err, targetRes] = await To(postModel.update({
          query: {
            _id: follow.targetId
          },
          update: {
            followCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          postModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;
      case 'category':
        // 开启事务
        let categoryTxErr, isCategoryTxOk;

        [categoryTxErr, isCategoryTxOk] = await categoryModel.startTransaction()

        // 事务开启冲突
        if (!isCategoryTxOk) {
          // 事务回滚
          followModel.rollback();
          // 返回错误信息
          ctx.throw(500, categoryTxErr);
          return
        }

        [err, targetRes] = await To(categoryModel.update({
          query: {
            _id: follow.targetId
          },
          update: {
            followCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;
      case 'user':
        [err, targetRes] = await To(userModel.update({
          query: {
            _id: follow.targetId
          },
          update: {
            fansCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;

      default:
        followModel.rollback();
        userModel.rollback();
        postModel.rollback();
        categoryModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    // 检查操作用户是否存在(更新操作用户信息)
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      }
    }))

    if (err) {
      // 事务回滚
      followModel.rollback();
      userModel.rollback();
      postModel.rollback();
      categoryModel.rollback();
      ctx.throw(500, err);
      return
    }

    // 没找到target
    if (!findUser) {
      // 事务回滚
      followModel.rollback();
      userModel.rollback();
      postModel.rollback();
      categoryModel.rollback();
      ctx.throw(500, '发起关注的用户不存在');
      return
    }

    // 找到并且修改发起关注所属用户的followXXCount和folowXX
    let userRes;
    let newFollowIds;

    switch (follow.type) {
      case 'post':
        newFollowCount = findUser.followPostCount - 1;
        newFollowIds = findUser.followPost.filter(postId => postId !== follow.targetId);

        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followPost: newFollowIds,
            followPostCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      case 'category':
        newFollowCount = findUser.followCategoryCount - 1;
        newFollowIds = findUser.followCategory.filter(categoryId => categoryId !== follow.targetId);

        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followCategory: newFollowIds,
            followCategoryCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }

        break;

      case 'user':
        newFollowCount = findUser.followPeopleCount - 1;
        newFollowIds = findUser.followPeople.filter(peopleId => peopleId !== follow.targetId);

        [err, userRes] = await To(userModel.update({
          query: {
            _id: userId
          },
          update: {
            followPeople: newFollowIds,
            followPeopleCount: newFollowCount,
          }
        }))

        // 更新失败，回滚事务，返回错误信息
        if (err) {
          // 事务回滚
          followModel.rollback();
          userModel.rollback();
          postModel.rollback();
          categoryModel.rollback();
          ctx.throw(500, err);
          return
        }
        break;

      default:
        followModel.rollback();
        userModel.rollback();
        postModel.rollback();
        categoryModel.rollback();
        ctx.throw(500, "关注类型错误");
        return;
        break;
    }

    // TODO：推送消息

    // 关联操作成功，提交事务
    followModel.endTransaction()
    userModel.endTransaction()
    postModel.endTransaction();
    categoryModel.endTransaction();

    successRes({
      ctx,
      message: '删除关注成功'
    })
    return
  }

  /**
   * 获取某用户的所有粉丝列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getFansByUser(ctx, next) {
    // 被查看用户id
    const {
      id
    } = ctx.params;

    // 登录用户id
    const {
      userId
    } = ctx.request.query;


    // 根据targetUserId过滤查找所有的关注者
    let err, fans;
    [err, fans] = await To(followModel.find({
      query: {
        type: 'user',
        targetId: id,
      },
      select: fansFollowSelect,
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

    // populate Fans 具体数据
    let populateOptions = [{
      path: 'userId',
      model: 'User',
      select: userFansSelect,
    }];

    [err, fans] = await To(followModel.populate({
      collections: fans,
      options: populateOptions
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 如果登录，则对每个关注者，查找登录用户是否关注
    if (userId) {
      let fanIds = fans.map(fan => fan.userId);
      let findFanArr;
      [err, findFanArr] = await To(followModel.find({
        query: {
          userId,
          type: 'user',
          targetId: {
            "$in": fanIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      let fanMap = {};

      findFanArr.forEach(fan => {
        fanMap[fan.targetId] = true
      })
      fans = fans.map(fan => {
        return {
          user: {
            ...fan.userId
          },
          ifFollow: fanMap[fan.userId._id] ? true : false
        }
      })

      // 查找成功返回数据
      successRes({
        ctx,
        data: fans,
        message: '获取 fans 成功'
      })
      return
    }

    // 未登录的数据重新处理
    fans = fans.map(fan => ({
      ifFollow: false,
      user: {
        ...fan.userId
      },
    }))

    // 查找成功返回数据
    successRes({
      ctx,
      data: fans,
      message: '获取 fans 成功'
    })
    return
  }

  /**
   * 获取某用户的关注的用户列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getFollowTargetUsersByUser(ctx, next) {
    // 被查看用户id
    const {
      id
    } = ctx.params;

    // 登录用户id
    const {
      userId
    } = ctx.request.query;


    // 根据userId过滤查找所有的关注者
    let err, fans;
    [err, fans] = await To(followModel.find({
      query: {
        type: 'user',
        userId: id,
      },
      select: fansFollowSelect,
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

    // populate 关注用户的具体数据
    let populateOptions = [{
      path: 'targetId',
      model: 'User',
      select: userFansSelect,
    }];

    [err, fans] = await To(followModel.populate({
      collections: fans,
      options: populateOptions
    }))

    console.log(fans)
    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 如果登录，则对每个被关注者，查找登录用户是否关注
    if (userId) {
      let targetIds = fans.map(fan => fan.targetId);
      let findFanArr;
      [err, findFanArr] = await To(followModel.find({
        query: {
          userId,
          type: 'user',
          targetId: {
            "$in": targetIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      let fanMap = {};

      findFanArr.forEach(fan => {
        fanMap[fan.targetId] = true
      })
      fans = fans.map(fan => {
        return {
          user: {
            ...fan.targetId
          },
          ifFollow: fanMap[fan.targetId._id] ? true : false
        }
      })

      // 查找成功返回数据
      successRes({
        ctx,
        data: fans,
        message: '获取 follow target users 成功'
      })
      return

    }

    // 未登录的数据重新处理
    fans = fans.map(fan => ({
      ifFollow: false,
      user: {
        ...fan.targetId
      },
    }))

    // 查找成功返回数据
    successRes({
      ctx,
      data: fans,
      message: '获取 follow target users 成功'
    })
    return
  }

  /**
   * 获取某用户的关注的分类列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getFollowTargetCategoryListByUser(ctx, next) {
    // 被查看用户id
    const {
      id
    } = ctx.params;

    // 登录用户id
    const {
      userId
    } = ctx.request.query;


    // 根据userId过滤查找所有关注的分类
    let err, categoryList;
    [err, categoryList] = await To(followModel.find({
      query: {
        type: 'category',
        userId: id,
      },
      select: categoryListFollowSelect,
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

    // populate 关注分类的具体数据
    let populateOptions = [{
      path: 'targetId',
      model: 'Category',
      select: userCategoryListSelect,
    }];

    [err, categoryList] = await To(followModel.populate({
      collections: categoryList,
      options: populateOptions
    }))

    console.log(categoryList)
    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 如果登录，则对每个被关注分类，查找登录用户是否关注
    if (userId) {
      // categoryIds
      let targetIds = categoryList.map(category => category.targetId);
      let findCategoryArr;
      [err, findCategoryArr] = await To(followModel.find({
        query: {
          userId,
          type: 'category',
          targetId: {
            "$in": targetIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      let categoryMap = {};

      findCategoryArr.forEach(category => {
        categoryMap[category.targetId] = true
      })
      categoryList = categoryList.map(category => {
        return {
          ...category.targetId,
          ifFollow: categoryMap[category.targetId._id] ? true : false
        }
      })

      // 查找成功返回数据
      successRes({
        ctx,
        data: categoryList,
        message: '获取 follow target category List 成功'
      })
      return

    }

    // 未登录的数据重新处理
    categoryList = categoryList.map(category => ({
      ...category.targetId,
      ifFollow: false,
    }))

    // 查找成功返回数据
    successRes({
      ctx,
      data: categoryList,
      message: '获取 follow target category List 成功'
    })
    return
  }

  // /**
  //  * 查看关注详细信息
  //  * 
  //  * @param ctx
  //  * @param next
  //  * @return {Promise.<void>}
  //  */
  // static async getFollow(ctx, next) {

  // }

  // /**
  //  * （暂时不需要）在获取评论时对每个评论使用，查看某评论下的关注列表
  //  * 
  //  * @param ctx
  //  * @param next
  //  * @param {string[]} followIds 该评论下的关注ids
  //  * @return {Promise.<void>}
  //  */
  // static async getFollowList(ctx, next, followIds) {

  // }

  /**
   * 修改关注详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateFollow(ctx, next) {

  }

}

module.exports = FollowController;