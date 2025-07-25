// EdgeOne Pages 配置文件
module.exports = {
  routes: [
    {
      src: '/(.*)',
      dest: '/api/handler.js'
    }
  ]
};