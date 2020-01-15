const mongoose = require('mongoose')

/**
 * 用于新建一个事务 transaction
 * @class Tx
 */
module.exports = class Tx {
  constructor() {
    // 事务操作对象
    this.session = null
  }
  
  /**
   * 开启一个事务
   * 
   * @return {[string, boolean]} [错误信息，验证通过与否]
   */
  async startTransaction() {
    // 有其他事务在执行
    if (this.session !== null) {
      return ['事务冲突', false]
    }
    this.session = await mongoose.startSession();
    await this.session.startTransaction();
    return ['', true]
  }

  /**
   * 正常结束提交一个事务
   * 
   * @return {void}
   */
  async endTransaction() {
    if (this.session === null) {
      return
    }
    await this.session.commitTransaction();
    this.session.endSession();
    this.session = null;
  }

  /**
   * 事务执行异常时回滚事务
   * 
   * @return {void}
   */
  async rollback() {
    if (this.session === null) {
      return
    }
    await this.session.abortTransaction();
    this.session.endSession();
    this.session = null;
  }

}