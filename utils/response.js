exports.internalErrRes = ({ctx, err}) => {
  ctx.status = 500
  ctx.body = {
    code: 1,
    message: err
  }
}

exports.successRes = ({ctx, data, message}) => {
  ctx.status = 200
  ctx.body = {
    code: 0,
    data,
    message
  }
}