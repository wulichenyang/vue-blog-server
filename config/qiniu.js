/*
七牛云配置
*/
const qiniu = require('qiniu')

// 创建上传凭证token，返回给用户
const accessKey = '-Pq3006XEDHYCGiQ1Xy6Xt7-UpUsnc_6MxGjhxo_'
const secretKey = 'UYSQq7lLFHUJR-ZjrBy-aE88bTh7pr77w4wncQNn'
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
const options = {
  scope: 'muse-forum',
  expires: 7200
}

const bucket = 'muse-forum'
// const putPolicy = new qiniu.rs.PutPolicy(options)
// const uploadToken = putPolicy.uploadToken(mac)

module.exports = {
  mac,
  options,
  bucket,
}