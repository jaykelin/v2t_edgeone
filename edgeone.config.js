// EdgeOne Pages 配置文件
module.exports = {
  framework: 'vue',
  routes: [
    {
      src: '/api/(.*)',
      dest: '/api/handler.js'
    },
    {
      src: '/(.*)',
      dest: '/index.html'
    }
  ]
};