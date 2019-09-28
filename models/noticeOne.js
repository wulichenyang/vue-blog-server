let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel');

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
  type: {
    type: String
  },
  // 消息触发者
  from: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 消息接受者
  to: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 消息相关文章id
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  // 消息相关评论id
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  // 消息相关回复id
  replyId: {
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  },
  // 是否已读
  hasRead: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: {
    // 创建日期
    createdAt: 'createdAt',
    // 更新日期
    updatedAt: 'updatedAt'
  }
});

// noticeOneSchema.index({ to: 1 });
// noticeOneSchema.index({ to: 1, createAt: -1, deleted: 1 });

noticeOneSchema.index({
  type: 1,
  from: 1,
  to: 1,
  postId: 1,
  commentId: 1,
  replyId: 1
}, {
  unique: true
});

let model = mongoose.model('NoticeOne', noticeOneSchema);

module.exports = new BaseModel(model);