let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel')

// 邮箱账户
let emailSchema = new Schema({
  // 邮箱账号
  email: {
    type: String,
    unique: true,
    trim: true
  },
  // 对应的用户id
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    unique: true
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
emailSchema.index({
  email: 1
}, {
  unique: true
});
emailSchema.index({
  userId: 1
}, {
  unique: true
});
emailSchema.index({
  email: 1,
  userId: 1
}, {
  unique: true
});

let model = mongoose.model('Email', emailSchema);

module.exports = new BaseModel(model);