let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 手机账户
let phoneSchema = new Schema({
  // 手机账号
  phone: { type: String, unique: true },
  // 对应的用户id
  userId: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
  // 创建日期
  createAt: { type: Date, default: Date.now() },
});

// 添加索引
phoneSchema.index({ phone: 1 }, { unique: true });
phoneSchema.index({ userId: 1 }, { unique: true });
phoneSchema.index({ phone: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Phone', phoneSchema);
