let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * 通知一个人的推送消息
 * 
 * @param type
 * follow-posts: xx 关注了你的文章
 * comment: xx 评论了你的文章
 * reply: xx 回复了你的 xx 评论
 * follow-you: xx 关注了你
 * like-comment: xx 赞了你的评论
 * like-reply: xx 赞了你的回复
 * new-comment: xx 评论了 xx 文章
 * like-post: xx 赞了你的 xx 文章
 */
const noticeOneSchema = new Schema({
  // 消息对象的类型
  type: { type: String },
  // 消息触发者
  fromId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 消息接受者
  toId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 消息相关文章id
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  // 消息相关评论id
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  // 消息相关回复id
  replyId: { type: Schema.Types.ObjectId, ref: 'Reply' },
  // 是否已读
  hasRead: { type: Boolean, default: false },
  // 创建日期
  createAt: { type: Date, default: Date.now() }
});

// noticeOneSchema.index({ toId: 1 });
// noticeOneSchema.index({ toId: 1, createAt: -1, deleted: 1 });

noticeOneSchema.index({ type: 1, fromId: 1, toId: 1, postId: 1, commentId: 1, replyId: 1 }, { unique: true });


module.exports = mongoose.model('NoticeOne', noticeOneSchema);
