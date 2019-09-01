let mongoose = require('mongoose');
let Schema = mongoose.Schema;

/**
 * 通知关注了文章的多人推送消息
 * 
 * @param type
 * comment: xx 评论了 xx 文章
 * reply: xx 回复了 xx 评论
 */
const noticeAllSchema = new Schema({
  // 发送人
  fromId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 接收人
  toId: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  // 信息的类型(comment/reply)
  type: { type: String, enum: ['comment', 'reply']},
  // 消息目标的id(comment/reply)
  targetId: { type: Schema.Types.ObjectId },
  // 创建日期
  createAt: { type: Date, default: Date.now() }
});

// 添加索引
noticeAllSchema.index({ fromId: 1, toId: 1, targetId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('NoticeAll', noticeAllSchema);
