let categoryModel = require('../models/category');
let To = require('../utils/to');
let {
  internalErrRes,
  successRes
} = require('../utils/response');
const xss = require('xss');
const {
  checkCategory,
  checkUpdateCategory
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
    // 获取category信息
    const {
      name,
      brief,
      avatar,
      sort
    } = ctx.request.body;

    // 检查category格式
    let err, isOk;
    [err, isOk] = checkCategory({
      name,
      brief,
      avatar,
      sort,
    })

    // 检查失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 通过检查
    // 查询是否已经有相同的文章分类
    let findCategory;
    [err, findCategory] = await (To(categoryModel.findOne({
      query: {
        name
      }
    })))

    // 查询失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 分类名冲突返回错误信息
    if (findCategory) {
      internalErrRes({
        ctx,
        err: '该文章分类已创建过'
      })
      return
    }

    // 分类名未重复，进行插入操作
    let res;
    [err, res] = await To(categoryModel.save({
      data: {
        name,
        brief,
        avatar,
        sort,
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 插入成功，返回成功信息
    successRes({
      ctx,
      message: '分类创建成功'
    })
    return
  }

  /**
   * 删除文章分类，需要级联删除文章、评论？
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async deleteCategory(ctx, next) {
    // 获取分类id
    const categoryId = ctx.params.id


    // 查找是否有该分类


    // 查找失败，返回错误信息


    // 未找到该分类，返回错误信息


    // 找到该分类，删除分类（用户关联信息修改），删除分类下的文章（用户关联信息修改），删除文章下的评论（用户关联信息修改）

    // 删除失败，返回错误信息


    // 删除成功，返回成功信息
  }

  /**
   * 查看文章分类详细信息
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCategory(ctx, next) {
    const categoryId = ctx.params.id

    let err, findCategory;
    [err, findCategory] = await To(categoryModel.find({
      query: {
        _id: categoryId
      }
    }))

    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    if (!findCategory) {
      internalErrRes({
        ctx,
        err: '查找分类详细信息失败'
      })
      return
    }

    successRes({
      ctx,
      data: findCategory,
      message: '查找分类详细信息成功'
    })
    return
  }

  /**
   * 查看所有文章分类列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getCategoryList(ctx, next) {
    let err, findCategoryList;
    [err, findCategoryList] = await To(categoryModel.find({
      query: {},
      select: {
        __v: 0
      },
      options: {
        sort: {
          sort: -1
        }
      }
    }))

    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    if (!findCategoryList) {
      internalErrRes({
        ctx,
        err: '查找分类失败'
      })
      return
    }

    if (findCategoryList) {
      successRes({
        ctx,
        data: findCategoryList,
        message: '查找分类列表成功'
      })
    }

    return
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
    // 获取修改对象id和修改属性
    const categoryId = ctx.params.id
    console.log(ctx.params.id)

    // 获取修改的category信息
    const {
      name,
      brief,
      avatar,
      sort
    } = ctx.request.body;

    // 检查category格式
    let err, isOk;
    [err, isOk] = checkCategory({
      name,
      brief,
      avatar,
      sort,
    })

    // 检测错误，返回错误信息
    if (!isOk) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 修改属性
    let res;
    [err, res] = await To(categoryModel.update({
      query: {
        _id: categoryId,
      },
      update: {
        name,
        brief,
        avatar,
        sort
      }
    }))

    // 修改失败，返回错误信息
    if (err) {
      internalErrRes({
        ctx,
        err
      })
      return
    }

    // 修改成功，返回成功信息
    successRes({
      ctx,
      message: '修改分类成功'
    })
    return
  }

}

module.exports = CategoryController;