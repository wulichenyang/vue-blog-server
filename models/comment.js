let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 一级评论
let commentSchema = new Schema({
  // 所属文章id
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  // 评论用户id
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  // 评论内容
  content: { type: String, defualt: '' },
  // 点赞数
  likeCount: { type: Number, default: 0 },
  // 回复（二级评论）ids
  reply: [{ type: Schema.Types.ObjectId, ref: 'Reply' }],
  // 评论状态 发布/草稿
  state: { type: String, enum: ['published', 'draft'] },
  // 评论日期（还用于sort）
  createAt: { type: Date, defualt: Date.now() },
  // 修改日期
  updateAt: { type: Date, default: Date.now() },

});

let model = mongoose.model('Comment', commentSchema);

module.exports = new BaseModel(model);