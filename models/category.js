let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 话题
let categorySchema = new Schema({
  // // 创建人: 暂时由管理员创建
  // author: { type: Schema.Types.ObjectId, ref: 'User' },

  // 话题名 唯一 作为文章类型话题检索的字段
  name: { type: String, unique: true },
  // 简介
  brief: { type: String, default: '' },
  // 详细描述
  description: { type: String, default: '' },
  // 话题简略图片
  avatar: { type: String, default: '' },
  // 话题详细背景图片
  background: { type: String, default: '' },
  // 关注总数
  followCount: { type: Number, default: 0 },
  // 该话题下文章数
  postCount: { type: Number, default: 0 },
  // 排序权重
  sort: { type: Number, default: 0 },
  // 创建日期
  createAt: { type: Date, default: Date.now() },

});

module.exports = mongoose.model('Category', categorySchema);
