const xss = require('xss')

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
  checkCategory: ({name, brief, description, sort}) => {
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
}