// mongodb 启动脚本
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);

const {
  DB_URL
} = require('../config')

/**
 * Connect to mongodb: database: museForum
 * 
 * @return {void}
 */
const runDB = () => {
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