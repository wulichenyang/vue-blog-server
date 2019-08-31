let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 点赞
let likeSchema = new Schema({
  // 发起点赞的用户
  userId: { type: Schema.Types.ObjectId },
  // 点赞对象类型（post/comment/reply）
  type: { type: String, enum: ['post', 'comment', 'reply'] },
  // 点赞对象id
  targetId: { type: Schema.Types.ObjectId },
  createAt: { type: Date, default: Date.now() }
});

// 建立索引
LikeSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
