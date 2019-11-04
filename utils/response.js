// /**
// * 返回错误信息
// * 
// * @param {object} ctx
// * @param {string} err 返回错误信息
// */
// exports.internalErrRes = ({ctx, err}) => {
//   ctx.status = 500
//   ctx.body = {
//     code: 1,
//     message: err
//   }
// }
/**
* 返回成功信息
* 
* @param {object} ctx
* @param {object} data 返回数据
* @param {string} message 返回信息
*/
exports.successRes = ({ctx, data, message}) => {
  ctx.status = 200
  ctx.body = {
    code: 0,
    data,
    message
  }
}