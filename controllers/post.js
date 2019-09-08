let postModel = require('../models/post')
let To = require('../utils/to')
let {
  internalErrRes,
  successRes
} = require('../utils/response')
const xss = require('xss')
const {
  checkPost
} = require('../utils/validate')

class PostController {

  /**
   * 添加文章
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addPost(ctx, next) {

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