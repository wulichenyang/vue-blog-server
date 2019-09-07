let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 用户
let userSchema = new Schema({

  /**
   * 邮箱/手机 单独保存
   */

  // // 邮箱号 唯一 用于登录
  // email: { type: String, unique: true },
  // // 手机号 唯一 用于登录
  // phone: { type: String, unique: true },

  // 密码
  password: String,
  // 用户的昵称（id） 唯一 初始值随机 辨别用户
  nickname: {
    type: String,
    unique: true
  },
  // 真实姓名 仅作为资料
  realname: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  // 性别 0女 \ 1男 \ 2保密
  gender: {
    type: Number,
    enum: [0, 1, 2],
    default: 2
  },
  // 生日
  birth: {
    type: Date,
    default: new Date('1990/1/1')
  },
  // 头像
  avatar: {
    type: String,
    default: ''
  },
  // 个性简介，70个字符限制
  brief: {
    type: String,
    default: ''
  },
  // 发帖数
  postCount: {
    type: Number,
    default: 0
  },
  // 粉丝数
  fansCount: {
    type: Number,
    default: 0
  },
  // 获赞数量
  likeCount: {
    type: Number,
    default: 0
  },

  /**
   * 所有关注信息和数量 
   */

  // 关注的人
  followPeople: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followPeopleCount: {
    type: Number,
    default: 0
  },

  // 关注的文章类别
  followCategory: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  followCategoryCount: {
    type: Number,
    default: 0
  },

  // 关注的文章
  followPost: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  followPostCount: {
    type: Number,
    default: 0
  },

  // 收藏的文章
  collectPost: [{
    type: Schema.Types.ObjectId,
    ref: 'Post'
  }],
  collectPostCount: {
    type: Number,
    default: 0
  },

  /**
   * 消息/私信/推送
   */

  // 最近一次查询Notice消息的日期
  lastFindNoticeAt: {
    type: Date
  },

  // 记录最早一条未读私信的日期
  unReadMessageAt: {
    type: Date
  },

  // 最近一次查询自己关注的feed的日期，用于有新的feed，与它比较是否有新的feed，显示小红点
  lastFindFeedAt: {
    type: Date
  },

  // 最近一次查询自己关注文章的日期
  lastFindFollowAt: {
    type: Date
  },
}, {
  timestamps: {
    // 创建日期
    createdAt: 'createdAt',
    // 更新日期
    updatedAt: 'updatedAt'
  }
});

let model = mongoose.model('User', userSchema);

module.exports = new BaseModel(model);