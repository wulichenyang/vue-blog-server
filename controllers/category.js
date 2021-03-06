let categoryModel = require('../models/category');
let followModel = require('../models/follow');

let To = require('../utils/to');
let {
  successRes
} = require('../utils/response');
const {
  stringXss,
} = require('../utils/xss')
const {
  checkCategory,
  checkUpdateCategory
} = require('../utils/validate');
const {
  categoryDetailSelect
} = require('../config/select')

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
      ctx.throw(500, err);
      return
    }

    // 通过检查
    // 查询是否已经有相同的文章分类
    let findCategory;
    [err, findCategory] = await (To(categoryModel.findOne({
      query: {
        name: stringXss(name)
      }
    })))

    // 查询失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
      return
    }

    // 分类名冲突返回错误信息
    if (findCategory) {
      ctx.throw(500, '该文章分类已创建过');
      return
    }

    // 分类名未重复，进行插入操作
    let res;
    [err, res] = await To(categoryModel.save({
      data: {
        name: stringXss(name),
        brief: stringXss(brief),
        avatar: stringXss(avatar),
        sort,
      }
    }))

    // 插入失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
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
  static async getCategoryDetail(ctx, next) {
    // 分类id
    const categoryId = ctx.params.id;

    // 登录用户id
    const {
      userId
    } = ctx.request.query;


    let err, findCategory;
    [err, findCategory] = await To(categoryModel.findOne({
      query: {
        _id: categoryId
      },
      select: categoryDetailSelect,
    }))

    if (err) {
      ctx.throw(500, err);
      return
    }

    if (!findCategory) {
      ctx.throw(500, '查找分类详细信息失败');
      return
    }

    // 如果登录，则对该分类查找是否关注
    if (userId) {
      let findCategoryFollow;
      [err, findCategoryFollow] = await To(followModel.findOne({
        query: {
          userId,
          type: 'category',
          targetId: categoryId,
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      // 已关注
      if(findCategoryFollow && findCategoryFollow._id) {
        findCategory = {
          ...findCategory,
          ifFollow: true
        }
      } else {
        // 未关注
        findCategory = {
          ...findCategory,
          ifFollow: false
        }
      }

    } else {
      // 未登录返回未关注
      findCategory = {
        ...findCategory,
        ifFollow: false
      }
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
      ctx.throw(500, err);
      return
    }

    if (!findCategoryList) {
      ctx.throw(500, '查找分类失败');
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
    // 在 controllers/follow下
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
      ctx.throw(500, err);
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
      ctx.throw(500, err);
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