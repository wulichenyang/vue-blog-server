let postModel = require('../models/post');
let categoryModel = require('../models/category')
let followModel = require('../models/follow');
let userModel = require('../models/user')
let To = require('../utils/to');
let likeModel = require('../models/like');
let {
  htmlToString,
  abstractImagesFromHTML
} = require('../utils/html2String')
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
      ctx.throw(500, err);
    }

    if (state === 'published') {
      // 发布文章
      await PostController.addPublishedPost(ctx, next)
    } else if (state === 'draft') {
      // 保存草稿
      await PostController.addDraftPost(ctx, next)
    } else {
      ctx.throw(500, "发布状态错误")
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
    [err, findCategory] = await To(categoryModel.findOne({
      query: {
        _id: categoryId
      }
    }))

    // 查找category错误
    if (err) {
      ctx.throw(500, err);
    }

    // 没找到category
    if (!findCategory) {
      ctx.throw(500, '没有该文章分类')
      return
    }

    // 检查user是否存在
    let findUser;
    [err, findUser] = await To(userModel.findOne({
      query: {
        _id: userId
      }
    }))

    // 查找user错误
    if (err) {
      ctx.throw(500, err);
    }

    // 没找到user
    if (!findUser) {
      ctx.throw(500, '没有该用户')
      return
    }

    // 找到 category 和 user，开启 category 事务
    let txErr, isTxOk;
    [txErr, isTxOk] = await categoryModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr)
      return
    }

    // 更新category下文章数
    let categoryRes;
    let newCount = findCategory.postCount + 1;
    [err, categoryRes] = await To(categoryModel.update({
      query: {
        _id: categoryId
      },
      update: {
        postCount: newCount
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      // 事务回滚
      categoryModel.rollback();
      ctx.throw(500, err)
      return
    }

    // 开启 user 事务
    [txErr, isTxOk] = await userModel.startTransaction()

    // 事务开启冲突
    if (!isTxOk) {

      // 返回错误信息
      ctx.throw(500, txErr)
      return
    }

    // 更新user下文章数
    let userRes;
    let userNewPostCount = findUser.postCount + 1;
    [err, userRes] = await To(userModel.update({
      query: {
        _id: userId
      },
      update: {
        postCount: userNewPostCount
      }
    }))

    // 更新失败，回滚事务，返回错误信息
    if (err) {
      // 事务回滚
      userModel.rollback();
      categoryModel.rollback();
      ctx.throw(500, err)
      return
    }

    // 更新成功，添加文章，xss过滤
    let savedPost;
    [err, savedPost] = await To(postModel.save({
      data: {
        author: userId,
        category: categoryId,
        title: stringXss(title),
        content: htmlXss(content),
        state: stringXss(state),
      }
    }))

    // 添加文章失败，回滚事务
    if (err) {
      // 事务回滚
      categoryModel.rollback()
      userModel.rollback()

      // 返回错误信息
      ctx.throw(500, err)

      return
    }

    // 关联操作成功，提交事务
    categoryModel.endTransaction()
    userModel.endTransaction()

    // 添加成功，返回成功信息
    successRes({
      ctx,
      data: savedPost,
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
   * 查看文章详细信息（populate评论 populate回复）
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPost(ctx, next) {
    // 获取 postId
    const {
      id
    } = ctx.params;

    // 获取用户（登录会返回ifLike）
    const {
      userId
    } = ctx.request.query;

    let err, isOk;
    [err, isOk] = await PostController.addViewCount(ctx, next, id)
    if (!isOk) {
      ctx.throw(500, err);
    }

    // 根据postId查找文章详细信息
    let postRes;
    [err, postRes] = await To(postModel.findOne({
      query: {
        _id: id
      },
      select: postDetailSelect,
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
    }

    let populateOptions = [{
        path: 'author',
        model: 'User',
        select: userBriefSelect,
      },
      {
        path: 'category',
        model: 'Category',
        select: categoryBriefSelect,
      },
      // 评论
      {
        path: 'comment',
        model: 'Comment',
        // match: {
        // },
        select: commentDetailSelect,
        options: {
          // limit: commentsLimit,
          sort: {
            createdAt: -1
          }
        },
        // 回复
        // Deep populate
        populate: [{
            path: 'author',
            model: 'User',
            select: userBriefSelect,
          },
          {
            path: 'reply',
            model: 'Reply',
            select: replyDetailSelect,
            options: {
              // limit: repliesLimit,
              createdAt: 1
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
        ]
      }
    ];

    // populate category和用户数据
    let postDetail;
    [err, postDetail] = await To(postModel.populate({
      collections: postRes,
      options: populateOptions
    }))

    // 查找失败，返回错误信息
    if (err) {
      ctx.throw(500, err);
    }

    // 如果登录，则对每条post，每条comment，每条reply查找是否点赞
    // 如果登录，查找用户是否关注该文章
    if (userId) {
      // post点赞
      let postId = postDetail._id;
      let findPostLike;
      [err, findPostLike] = await To(likeModel.findOne({
        query: {
          userId,
          type: 'post',
          targetId: postId,
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      postDetail = {
        ...postDetail,
        ifLike: findPostLike ? true : false
      }

      // comments 点赞
      let commentIds = postDetail.comment.map(comment => comment._id);
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
        ctx.throw(500, err)
        return
      }

      let likeCommentMap = {};

      findCommentLikeArr.forEach(like => {
        likeCommentMap[like.targetId] = true
      })

      postDetail = {
        ...postDetail,
        comment: postDetail.comment.map(comment => {
          return {
            ...comment,
            ifLike: likeCommentMap[comment._id] ? true : false
          }
        })
      }

      // reply 点赞
      let replyIds = []
      postDetail.comment.forEach(comment => {
        replyIds = [
          ...replyIds,
          ...comment.reply.map(reply => {
            return reply._id
          })
        ]
      })

      let findReplyLikeArr;

      [err, findReplyLikeArr] = await To(likeModel.find({
        query: {
          userId,
          type: 'reply',
          targetId: {
            "$in": replyIds
          },
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      let likeReplyMap = {};

      findReplyLikeArr.forEach(like => {
        likeReplyMap[like.targetId] = true
      })

      postDetail = {
        ...postDetail,
        comment: postDetail.comment.map(comment => {
          return {
            ...comment,
            reply: comment.reply.map(reply => {
              return {
                ...reply,
                ifLike: likeReplyMap[reply._id] ? true : false
              }
            })
          }
        })
      }

      // 查找用户是否关注该分类
      let findPostFollow;
      [err, findPostFollow] = await To(followModel.findOne({
        query: {
          userId,
          type: 'post',
          targetId: postId,
        }
      }))

      // 查找失败，返回错误信息
      if (err) {
        ctx.throw(500, err)
        return
      }

      // 已关注
      if(findPostFollow && findPostFollow._id) {
        postDetail = {
          ...postDetail,
          ifFollow: true
        }
      } else {
        // 未关注
        postDetail = {
          ...postDetail,
          ifFollow: false
        }
      }
    } else {
      // 未登录返回未关注
      postDetail = {
        ...postDetail,
        ifFollow: false
      }
    }

    successRes({
      ctx,
      data: postDetail,
      message: '获取 postDetail 成功'
    })
    return
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
    // 获取categoryID
    const {
      id
    } = ctx.params;

    // 获取登录用户（登录会返回ifLike）
    const {
      userId
    } = ctx.request.query;

    // 根据categoryId过滤查找所有的文章列表
    let err, postsRes;
    [err, postsRes] = await To(postModel.find({
      query: {
        category: id
      },
      select: postBriefSelect,
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

    // content 中提取第一张图片，作为简介展示
    // content 的标签去除显示纯文字，截取部分内容
    postsRes = postsRes.map(post => ({
      ...post,
      firstPic: abstractImagesFromHTML(post.content)[0] || null,
      content: htmlToString(post.content).slice(0, 100) + '...'
    }))
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

    // populatecategory和用户数据
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

  /**
   * 获取某用户的发表文章列表
   * 
   * @param ctx
   * @param next
   * @return {Promise.<void>}
   */
  static async getPostListByUser(ctx, next) {
    // 用户id
    const {
      id
    } = ctx.params;

    // 获取用户（登录会返回ifLike）
    const {
      userId
    } = ctx.request.query;

    // 查找该用户发布的文章
    let userPostList, err;
    [err, userPostList] = await To(postModel.find({
      query: {
        author: id
      },
      select: postBriefSelect,
      options: {
        sort: {
          createdAt: -1
        }
      }
    }))

    // 查找Posts错误
    if (err) {
      ctx.throw(500, err);
    }

    // content 中提取第一张图片，作为简介展示
    // content 的标签去除显示纯文字，截取部分内容
    userPostList = userPostList.map(post => ({
      ...post,
      firstPic: abstractImagesFromHTML(post.content)[0] || null,
      content: htmlToString(post.content).slice(0, 100) + '...'
    }))

    // populate category和用户数据
    let postBriefList;
    [err, postBriefList] = await To(postModel.populate({
      collections: userPostList,
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
      message: '获取userPosts成功'
    })
    return
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

  /**
   * 增加文章浏览数
   * 
   * @param ctx
   * @param next
   * @param {string} postId 浏览的文章id
   * @return {Promise.<[string, boolean]>} [err, isOk]
   */
  static async addViewCount(ctx, next, postId) {
    // 初始化postViewMap访问记录
    if (!ctx.session.postViewMap) {
      ctx.session.postViewMap = {}
    }

    // 检查session的postViewMap里postId对应的是文章访问记录否存在
    let lastViewTime = ctx.session.postViewMap[postId]
    if (lastViewTime) {

      // 存在则已经访问过该文章，判断时间是否过期
      let timeNow = new Date().getTime()

      // 大于一天算过期
      if ((timeNow - lastViewTime) > (24 * 60 * 60 * 1000)) {

        // 访问记录过期，则可以继续增加访问数，并刷新时间，
        ctx.session.postViewMap[postId] = timeNow
      } else {
        // 访问记录未过期，不作处理
        return ['', true]
      }
    } else {
      // 不存在该文章的访问记录，是第一次访问，记录访问时间
      ctx.session.postViewMap[postId] = new Date().getTime()
    }

    // 根据postId查找文章
    let err, findPost;
    [err, findPost] = await To(postModel.findOne({
      query: {
        _id: postId
      },
    }))

    // 查找失败，返回错误信息
    if (err) {
      return [err, false]
    }

    // 查找成功，修改文章viewCount+1
    let postRes;
    let newCount = findPost.viewCount + 1;
    [err, postRes] = await To(postModel.update({
      query: {
        _id: postId
      },
      update: {
        viewCount: newCount
      }
    }))

    // 更新失败，返回错误信息
    if (err) {
      return [err, false]
    }

    // 更新成功
    return ['', true]
  }

}

module.exports = PostController;