const xss = require('xss')

// TODO:
module.exports = {

  /**
   * 检查手机格式正确性
   * 
   * @param {stirng} phone 手机号
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkPhone: (phone) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },
  /**
   * 检查邮箱格式正确性
   * 
   * @param {stirng} email 邮箱号
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkEmail: (email) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },
  /**
   * 检查昵称格式正确性
   * 
   * @param {stirng} email 昵称号
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkNickname: (nickname) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },
  /**
   * 检查密码格式正确性
   * 
   * @param {stirng} pwd 密码号
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkPwd: (pwd) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查文章分类格式正确性
   * 
   * @param {object} category 文章分类对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkCategory: ({name, brief, avatar, sort}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查用户设置信息格式正确性
   * 
   * @param {object} userSettingInfo 用户设置信息对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkUserSetting: ({avatar, nickname, brief, birth, gender}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查修改文章分类格式字段正确性
   * 
   * @param {object} category 文章分类对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkUpdateCategory: (key, value) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查文章格式正确性
   * 
   * @param {object} post 文章对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkPost: ({author, category, title, content, state}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查评论格式正确性
   * 
   * @param {object} comment 评论对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkComment: ({postId, author, content, state}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查回复格式正确性
   * 
   * @param {object} reply 回复对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkReply: ({commentId, from, to, content, state}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查点赞格式正确性
   * 
   * @param {object} like 回复对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkLike: ({targetId, userId, type, authorId}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查关注格式正确性
   * 
   * @param {object} follow 关注对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkFollow: ({targetId, userId, type}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查更新用户对象格式
   * 
   * @param {object} userInfo 更新用户信息
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkUserUpdateObj: ({nickname, realname, role, gender, birth,  avatar, brief,  postCount, fansCount, likeCount, followPeople, followPeopleCount, followCategory, followCategoryCount, followPost, followPostCount, collectPost, collectPostCount, password}) => {
    // if(err){
    //   return ['err info', false]
    // }
    return ['', true]
  },

  /**
   * 检查更新用户新旧密码
   * 
   * @param {object} passwordObject 新旧密码对象
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  checkUserUpdatePwd: ({oldPassword, newPassword}) => {
    if(oldPassword === newPassword){
      return ['新旧密码相同，修改失败', false]
    }
    // TODO
    return ['', true]
  },
}