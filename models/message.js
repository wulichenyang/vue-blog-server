let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let BaseModel = require('./BaseModel');

// 私信
let messageSchema = new Schema({
  // 发件人
  fromId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 接收人
  toId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 消息类型 0：普通消息，1：系统消息
  type: {
    type: Number,
    default: 0
  },
  // 内容
  content: {
    type: String,
    default: ''
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

let model = mongoose.model('Message', messageSchema);

module.exports = new BaseModel(model);