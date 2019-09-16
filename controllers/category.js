let categoryModel = require('../models/category');
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const xss = require('xss');
const {
  checkCategory
} = require('../utils/validate');

class CategoryController {

  /**
   * 添加文章分类
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async addCategory(ctx, next) {

  }

  /**
   * 删除文章分类
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteCategory(ctx, next) {

  }

  /**
   * 查看文章分类详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCategory(ctx, next) {

  }

  /**
   * 查看所有文章分类列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCategoryList(ctx, next) {

  }

  /**
   * 查看自身关注的所有文章分类列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getFollowCategoryList(ctx, next) {

  }

  /**
   * 修改文章分类详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async updateCategory(ctx, next) {

  }

}

module.exports = CategoryController;