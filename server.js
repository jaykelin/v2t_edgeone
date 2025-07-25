const http = require('http');
const url = require('url');
const { handler } = require('./api/handler.js');

// 创建本地开发服务器
const server = http.createServer(async (req, res) => {
  // 构造事件对象
  const event = {
    path: url.parse(req.url).pathname,
    httpMethod: req.method,
    headers: req.headers,
    queryStringParameters: url.parse(req.url, true).query,
    body: null
  };

  // 如果有请求体，读取它
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      event.body = body;
      // 调用处理函数
      const result = await handler(event, {});
      
      // 发送响应
      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    });
  } else {
    // 调用处理函数
    const result = await handler(event, {});
    
    // 发送响应
    res.writeHead(result.statusCode, result.headers);
    res.end(result.body);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});