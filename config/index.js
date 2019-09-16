module.exports = {
  // mongodb 连接路径
  DB_URL: 'mongodb://localhost:29031/museForum',
  // 路由前缀
  ApiPrefix: "/muse-forum-api-v1",
  // jwt 签名私钥
  privateKey: "halo$qw1",
  // koa-session 配置信息
  koaSessionConfig: {
    key: 'koa:sess', //cookie key (default is koa:sess)
    maxAge: 86400000, // cookie的过期时间 maxAge in ms (default is 1 days)
    overwrite: true, //是否可以overwrite    (默认default true)
    httpOnly: true, //cookie是否只有服务器端可以访问 httpOnly or not (default true)
    signed: true, //签名默认true
    rolling: false, //在每次请求时强行设置cookie，这将重置cookie过期时间（默认：false）
    renew: false, //(boolean) renew session when session is nearly expired,
  }
}