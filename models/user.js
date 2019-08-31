let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 用户
let userSchema = new Schema({
  // // 邮箱号 唯一 用于登录
  // email: { type: String, unique: true },

  // 手机号 唯一 用于登录
  phone: { type: String, unique: true },
  // 密码
  password: String,
  // 用户的昵称（id） 唯一 初始值随机 辨别用户
  nickname: { type: String, unique: true },
  // 真实姓名 仅作为资料
  realname: { type: String, default: '保密' },
  // 角色 ['admin', 'user']
  role: { type: String, default: 'user' },
  // 性别 0女 \ 1男 \ 2保密
  gender: { type: Number, enum: [0, 1, 2], default: 2 },
  // 生日
  birth: { type: Date, default: new Date('1990/1/1') },
  // 头像
  avatar: { type: String, default: '' },
  // 个性简介，70个字符限制
  brief: { type: String, default: '编辑个人简介，展示我的独特态度' },
  // 发帖数
  postCount: { type: Number, default: 0 },
  // 粉丝数
  fansCount: { type: Number, default: 0 },
  // 获赞数量
  likeCount: { type: Number, default: 0 },

  /* 
  * 所有关注信息和数量 
  */

  // 关注的人
  followPeople: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followPeopleCount: { type: Number, default: 0 },

  // 关注的文章类别
  followCategory: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  followCategoryCount: { type: Number, default: 0 },

  // 关注的文章
  followPost: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  followPostCount: { type: Number, default: 0 },

  /* 
  * TODO：推送消息
  */ 

  // 创建日期
  createAt: { type: Date, default: Date.now() },
});

module.exports = mongoose.model('User', userSchema);
