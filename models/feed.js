let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// feed 推送消息
const feedSchema = new Schema({
  // 推送目标用户id
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 推送文章类别id
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  // 推送文章id
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  // 推送评论id
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  // 推送回复id
  replyId: { type: Schema.Types.ObjectId, ref: 'Reply' },
  // 创建时间
  createAt: { type: Date, default: Date.now() }
});

// // TODO：
// // 保存后socket.io 触发事件推送信息给订阅用户
// Feed.pre('save', function() {
//   emit('member', { type: 'new-feed' });
//   next();
// });

// 添加索引
feedSchema.index({ userId: 1, categoryId: 1, postId: 1, commentId: 1, replyId: 1 }, { unique: true });

let model = mongoose.model('Feed', feedSchema);

module.exports = new BaseModel(model);