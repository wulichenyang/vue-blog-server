let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 关注记录
let followSchema = new Schema({
  // 发起关注的用户
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  // 关注对象类型（post/category/user）
  type: { type: String, enum: ['post', 'category', 'user'] },
  // 关注对象id
  targetId: { type: Schema.Types.ObjectId },
  // 创建日期
  createAt: { type: Date, default: Date.now() }
});

// 添加索引
followSchema.index({ userId: 1, type: 1, targetId: 1 }, { unique: true });

let model = mongoose.model('Follow', followSchema);

module.exports = new BaseModel(model);
