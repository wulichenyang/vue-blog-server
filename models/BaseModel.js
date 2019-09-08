const mongoose = require('mongoose')

/**
 * 封装 mongoose，包含创建基础数据操作功能、事务回滚功能
 * 使用函数时，需要配合 utils/to.js 中间件，返回[err, data]，处理错误，返回给用户
 * 或者使用 try...catch 语句，捕获错误信息，返回给用户
 * @class BaseModel
 */
class BaseModel {
  constructor(model) {
    this.model = model
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

  /**
   * 执行数据库操作后的回调方法
   * @param  {Function}   resolve 成功
   * @param  {Function}   reject  失败
   * @return {Function}
   */
  callback(resolve, reject) {
    return (err, res) => {

      if (res && typeof res == 'object') {
        // 这里转换的目的是将 _id 是 ObjectId 类型，需要转换成 String 类型
        try {
          res = JSON.parse(JSON.stringify(res));
        } catch (error) {
          reject(error);
          return;
        }
      }

      err ? reject(err) : resolve(res);
    }
  }

  /**
   * 储存文档，可开启事务，支持回滚
   * @param {Object} data - 储存对象
   * @return {Object} promise
   */
  save({
    data
  }) {
    return new Promise((resolve, reject) => {
      if (!data) return reject('Data is null');
      new this.model(data).save({
        session: this.session
      }, this.callback(resolve, reject));
    });
  }

  /**
   * 查找一条数据
   * @param {Object} object
   * @param {Object} object.query - 查询条件
   * @param {Object} object.select - 返回字段
   * @param {Object} object.options - 选项（排序、数量等）
   * @return {Object} promise
   */
  findOne({
    query,
    select = {},
    options = {}
  }) {
    return new Promise((resolve, reject) => {
      if (!query) return reject('Query is null');
      let find = this.model.findOne(query, select);
      for (let i in options) find[i](options[i]);
      find.exec(this.callback(resolve, reject));
    });
  }

  /**
   * 查询多个
   * @param {Object} query 查询条件
   * @param {Object} select 返回字段
   * @param {Object} options 选项（排序、数量等）
   * @return {Object} promise
   */
  find({
    query,
    select = {},
    options = {}
  }) {
    return new Promise((resolve, reject) => {
      if (!query) return reject('Query is null');
      let find = this.model.find(query, select);
      for (let i in options) find[i](options[i]);
      find.exec(this.callback(resolve, reject));
    });
  }

  /**
   * 填充查询 - 基于 find 或 findOne 查询的文档，查询文档中关联的文档
   * @param {Object} collections 文档
   * @param {Object} options 选项（排序、数量等）
   * @return {Object} promise
   */
  populate({
    collections,
    options = {}
  }) {
    return new Promise((resolve, reject) => {
      if (!collections) return reject('Collections is null');
      this.model.populate(collections, options, this.callback(resolve, reject));
    });
  }

  /**
   * 更新文档，可开启事务，支持回滚
   * @param {Object} query 查询条件
   * @param {Object} update 更新字段
   * @param {Object} options 选项
   * @return {Object} promise
   */
  update({
    query,
    update,
    options = {}
  }) {
    options = {
      ...options,
      session: this.session
    }
    return new Promise((resolve, reject) => {
      if (!query) return reject('Query is null');
      if (!update) return reject('Update is null');
      this.model.update(query, update, options, this.callback(resolve, reject));
    });
  }

  /**
   * 移除文档 不支持事务回滚
   * @param {Object} query 移除条件
   * @return {Object} promise
   */
  remove({
    query
  }) {
    return new Promise((resolve, reject) => {
      if (!query) return reject('Query is null');
      this.model.remove(query, this.callback(resolve, reject));
    });
  }

  /**
   * 计数查询
   * @param {Object} query 查询条件
   * @return {Object} promise
   */
  count({
    query = {}
  }) {
    return new Promise((resolve, reject) => {
      this.model.count(query, this.callback(resolve, reject));
    });
  }

}

module.exports = BaseModel;