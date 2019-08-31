let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 关注
let followSchema = new Schema({
  // 发起关注的用户
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 关注的文章id
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  // 关注的话题id
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  // 关注的人id
  personId: { type: Schema.Types.ObjectId, ref: 'User' },
  createAt: { type: Date, default: Date.now() }
});

// 建立索引
followSchema.index({ userId: 1, postId: 1, categoryId: 1, personId: 1 }, { unique: true });

module.exports = mongoose.model('Follow', followSchema);
