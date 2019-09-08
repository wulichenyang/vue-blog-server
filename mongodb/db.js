// mongodb 启动脚本
const mongoose = require('mongoose')

const {
  DB_URL
} = require('../config')

/**
 * Connect to mongodb: database: museForum
 * 
 * @return {void}
 */
const runDb = () => {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true
  }, function (err) {
    if (err) {
      console.log('Connection Error:' + err)
    } else {
      console.log('Connection success!')
    }
  })
}

module.exports = runDB