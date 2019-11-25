let postModel = require('../models/post');
let categoryModel = require('../models/category')
let userModel = require('../models/user')
let To = require('../utils/to');
let likeModel = require('../models/like');
let {
  successRes
} = require('../utils/response');
const {
  postBriefSelect,
  postDetailSelect,
  userBriefSelect,
  categoryBriefSelect,
  commentDetailSelect,
  replyDetailSelect,
} = require('../config/select')
const {
  postBriefPopulateOptions
} = require('../config/populateOption')
const {
  stringXss,
  htmlXss
} = require('../utils/xss')
const {
  checkPost
} = require('../utils/validate');

class SearchController {


  /**
   * 搜索所有的文章、分类、用户
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async searchAll(ctx, next) {
    // 获取searchKey
    const {
      key
    } = ctx.query;

    // 获取登录用户（登录会返回ifLike）
    const {
      userId
    } = ctx.request.query;

    // 根据 key （标题、内容）过滤查找所有的文章列表
    let err, postsRes;
    [err, postsRes] = await To(postModel.find({
      query: {
        title: {
          $regex: key,
          $options: 'i'
        }
      },
      select: postBriefSelect,
      options: {
        sort: {
          createdAt: -1
        }
      }
    }))
    console.log(postsRes)
    
    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
    }

    // let populateOptions = postBriefPopulateOptions;
    // {
    //   //TODO:
    //   path: 'comment',
    //   model: 'Comment',
    //   // match: {
    //   // },
    //   select: {
    //     // '_id': 1,
    //     // 'content_html': 1,
    //     // 'create_at': 1,
    //     // 'reply_count': 1,
    //     // 'like_count': 1,
    //     // 'user_id': 1,
    //     // 'posts_id': 1
    //   },
    //   options: {
    //     // limit: commentsLimit,
    //     // sort: _commentsSort
    //   }
    // }
    // ];

    // populate category和用户数据
    let postBriefList;
    [err, postBriefList] = await To(postModel.populate({
      collections: postsRes,
      options: postBriefPopulateOptions
    }))
    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
    }

    // 如果登录，则对每条post，查找是否点赞
    if (userId) {
      let postIds = postBriefList.map(post => post._id);
      let findLikeArr;
      [err, findLikeArr] = await To(likeModel.find({
        query: {
          userId,
          type: 'post',
          targetId: {
            "$in": postIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      let likeMap = {};

      findLikeArr.forEach(like => {
        likeMap[like.targetId] = true
      })

      postBriefList = postBriefList.map(post => {
        return {
          ...post,
          ifLike: likeMap[post._id] ? true : false
        }
      })
    }

    // 查找成功返回数据
    successRes({
      ctx,
      data: postBriefList,
      message: '获取postBriefList成功'
    })
    return
  }

}

module.exports = SearchController;