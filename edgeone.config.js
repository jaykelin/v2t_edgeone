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
  ],
  // 环境变量配置
  env: {
    // BACKEND_URL 用于配置后端服务转发
    BACKEND_URL: process.env.BACKEND_URL || '',
    // URL 用于首页重定向 (现在通过 edgeone.json 处理)
    URL: process.env.URL || ''
  }
};