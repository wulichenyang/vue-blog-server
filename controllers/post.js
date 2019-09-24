let postModel = require('../models/post');
let categoryModel = require('../models/category')
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const xss = require('xss');
const {
  checkPost
} = require('../utils/validate');

class PostController {

  /**
   * 添加文章总接口
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addPost(ctx, next) {
    // 检查文章
    const {
      title,
      content,
      state
    } = ctx.request.body;
    const userId = ctx.userId
    const categoryId = ctx.params.id

    let err, isOk;
    [err, isOk] = checkPost({
      author: userId,
      category: categoryId,
      title,
      content,
      state
    })

    // 检查失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    if (state === 'published') {
      // 发布文章
      PostController.addPublishedPost(ctx, next)
    } else if (state === 'draft') {
      // 保存草稿
      PostController.addDraftPost(ctx, next)
    } else {
      internalErrRes({
        ctx,
        err: "发布状态错误"
      })
      return
    }
  }


  /**
   * 添加发布文章
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addPublishedPost(ctx, next) {
    const {
      title,
      content,
      state
    } = ctx.request.body;
    const userId = ctx.userId
    const categoryId = ctx.params.id

    // 检查category是否存在
    let err, findCategory;
    [err, findCategory] = await To(categoryModel.find({
      query: {
        _id: categoryId
      }
    }))

    // 查找category错误
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 没找到category
    if (!findCategory) {
      internalErrRes({
        ctx,
        err: '没有该文章分类'
      })
      return
    }

    // 找到category，开启事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await categoryModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err: txErr
      })
      return
    }
    // 更新category下文章数
    let err, categoryRes;
    [err, categoryRes] = await To(categoryModel.update({
      query: {
        _id: categoryId
      },
      update: {
        postCount: findCategory.postCount + 1
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })

      // 事务回滚
      await categoryModel.rollback();
      return
    }

    // 更新成功，添加文章，xss过滤
    let savedPost;
    [err, savedPost] = await To(postModel.save({
      data: {
        author: userId,
        category: categoryId,
        title,
        content,
        state,
      }
    }))

    // 添加文章失败，回滚事务
    if (err) {

      // 返回错误信息
      internalErrRes({
        ctx,
        err
      })

      // 文章分类修改事务回滚
      await categoryModel.rollback()
      return
    }

    // 关联操作成功，提交事务
    await userModel.endTransaction()
    
    // 添加成功，返回成功信息
    successRes({
      ctx,
      message: '发布成功'
    })
    return
  }

  /**
   * 添加文章草稿
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addDraftPost(ctx, next) {
    // 检查通过，检查category是否存在

    // 查找category错误


    // 没找到category


    // 找到category，开启事务，更新category下文章数


    // 更新失败，回滚事务，返回错误信息


    // 更新成功，添加文章，xss过滤


    // 添加失败，回滚事务


    // 添加成功，返回成功信息



  }


  /**
   * 删除文章
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deletePost(ctx, next) {

  }

  /**
   * 查看文章详细信息（populate评论？no，单独在getComment时获取comments和populate(replies)）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPost(ctx, next) {

  }

  /**
   * 查看所有文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPostList(ctx, next) {

  }

  /**
   * 查看某分类下文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPostListByCategory(ctx, next) {

  }

  /**
   * 获取某用户的发表文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPostListByUser(ctx, next) {

  }

  /**
   * 获取用户自身的关注文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getSelfFollowPostList(ctx, next) {

  }

  /**
   * 获取用户自身的收藏文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getSelfCollectPostList(ctx, next) {

  }

  /**
   * 修改文章详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updatePost(ctx, next) {

  }

}

module.exports = PostController;