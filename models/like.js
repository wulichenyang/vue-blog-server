let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel');

// 点赞记录
let likeSchema = new Schema({
  // 发起点赞的用户
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 点赞对象类型（post/comment/reply）
  type: {
    type: String,
    enum: ['post', 'comment', 'reply']
  },
  // 点赞对象id
  targetId: {
    type: Schema.Types.ObjectId
  },
}, {
  timestamps: {
    // 创建日期
    createdAt: 'createdAt',
    // 更新日期
    updatedAt: 'updatedAt'
  }
});

// 添加索引
LikeSchema.index({
  userId: 1,
  type: 1,
  targetId: 1
}, {
  unique: true
});

let model = mongoose.model('Like', likeSchema);
module.exports = new BaseModel(model);