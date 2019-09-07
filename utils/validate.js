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
}