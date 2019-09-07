let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 反馈举报
const reportSchema = new Schema({
  // 发起反馈用户id
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 反馈文章id
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  // 反馈评论id
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  // 反馈回复id
  replyId: {
    type: Schema.Types.ObjectId,
    ref: 'Reply'
  },
  // 反馈对象用户id
  personId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 反馈id
  reportId: {
    type: Number
  },
  // 反馈描述
  detail: {
    type: String
  },
}, {
  timestamps: {
    // 创建日期
    createdAt: 'createdAt',
    // 更新日期
    updatedAt: 'updatedAt'
  }
});

let model = mongoose.model('Report', reportSchema);

module.exports = new BaseModel(model);