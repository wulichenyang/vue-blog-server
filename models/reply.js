let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 二级评论（回复评论/回复reply）
let replySchema = new Schema({
  // 所属评论id
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  // 回复作者id
  fromId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 回复对象用户id
  toId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 评论内容
  content: { type: String, defualt: '' },
  // 点赞数
  likeCount: { type: Number, default: 0 },
  // 评论日期
  createAt: { type: Date, defualt: Date.now() },
  // 修改日期
  updateAt: { type: Date, default: Date.now() },
  // 评论状态 发布/草稿
  state: { type: String, enum: ['published', 'draft'] }

});

module.exports = mongoose.model('Reply', replySchema);
