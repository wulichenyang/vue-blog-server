let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel');

// 一级评论
let commentSchema = new Schema({
  // 所属文章id
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  // 评论用户id
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 评论内容
  content: {
    type: String,
    defualt: ''
  },
  // 点赞数
  likeCount: {
    type: Number,
    default: 0
  },
  // 回复（二级评论）ids
  reply: [{
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  }],
  // 评论状态 发布/草稿
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

let model = mongoose.model('Comment', commentSchema);

module.exports = new BaseModel(model);