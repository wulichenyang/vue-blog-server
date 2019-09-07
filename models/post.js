let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 文章
let postSchema = new Schema({
  // 文章作者
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 文章分类标签
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  // 文章标题
  title: {
    type: String,
    default: ''
  },
  // 文章内容
  content: {
    type: String,
    default: ''
  },
  // 文章浏览数
  viewCount: {
    type: Number,
    default: 0
  },
  // 关注累计
  followCount: {
    type: Number,
    default: 0
  },
  // 文章点赞次数
  likeCount: {
    type: Number,
    default: 0
  },
  // 文章评论ids
  comment: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // 文章评论/回复次数
  commentCount: {
    type: Number,
    default: 0
  },
  // 文章状态 发布/草稿
  state: {
    type: String,
    enum: ['published', 'draft']
  },
}, {
  timestamps: {
    // 创建日期
    createdAt: 'createdAt',
    // 更新日期
    updatedAt: 'updatedAt'
  }
});


let model = mongoose.model('Post', postSchema);

module.exports = new BaseModel(model);