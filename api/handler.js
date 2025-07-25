// api/handler.js
const url = require('url');

// 导出处理函数
exports.handler = async (event, context) => {
  const { path, httpMethod, headers, queryStringParameters, body } = event;
  
  try {
    // 获取环境变量
    const BACKEND_URL = process.env.BACKEND_URL || '';
    const REDIRECT_URL = process.env.URL || '';
    
    // 解析请求路径
    const pathname = path;
    
    // 输出环境变量信息用于调试
    console.log('Environment variables:');
    console.log('BACKEND_URL:', BACKEND_URL);
    console.log('URL (REDIRECT_URL):', REDIRECT_URL);
    console.log('Request path:', pathname);
    
    // 处理重定向逻辑
    if (pathname === '/api/redirect' && REDIRECT_URL) {
      console.log('Redirecting to:', REDIRECT_URL);
      return {
        statusCode: 302,
        headers: {
          'Location': REDIRECT_URL
        },
        body: ''
      };
    }
    
    // 后端服务转发逻辑
    if (BACKEND_URL) {
      // 按行分割，并过滤掉空行
      const backendUrls = BACKEND_URL.trim().split('\n').filter(line => line.trim() !== '');
      
      for (const backendUrlString of backendUrls) {
        try {
          // 解析每行的 URL
          const backendUrl = new URL(backendUrlString.trim());
          const pathToMatch = backendUrl.pathname;
          
          // 如果请求路径以配置的路径开头，则进行转发
          if (pathname.startsWith(pathToMatch)) {
            // 构建目标 URL
            const targetUrl = new URL(backendUrl);
            
            // 计算路径的剩余部分
            const remainingPath = pathname.substring(pathToMatch.length);
            // 确保路径以/开头或者为空
            const finalPath = remainingPath.startsWith('/') || remainingPath === '' ? remainingPath : '/' + remainingPath;
            
            // 设置目标路径
            targetUrl.pathname = targetUrl.pathname + finalPath;
            
            // 添加查询参数
            if (queryStringParameters) {
              Object.keys(queryStringParameters).forEach(key => {
                targetUrl.searchParams.append(key, queryStringParameters[key]);
              });
            }
            
            // 构建转发请求配置
            const requestOptions = {
              method: httpMethod,
              headers: headers || {}
            };
            
            // 如果有请求体，添加到配置中
            if (body) {
              requestOptions.body = body;
            }
            
            // 发送请求到后端
            const response = await fetch(targetUrl, requestOptions);
            
            // 获取响应数据
            const responseBody = await response.text();
            
            // 返回响应
            return {
              statusCode: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              body: responseBody
            };
          }
        } catch (e) {
          console.error(`Invalid URL in BACKEND_URL: "${backendUrlString}"`, e);
        }
      }
    }
    
    // 返回 404
    console.log('Returning 404 - Not Found');
    return {
      statusCode: 404,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Not Found'
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Internal Server Error'
    };
  }
};

// 代理 URL 函数
async function proxyUrl(proxyUrl, targetPath) {
  const urlList = await parseUrls(proxyUrl);
  const fullUrl = urlList[Math.floor(Math.random() * urlList.length)];
  
  try {
    // 解析目标 URL
    let parsedUrl = new URL(fullUrl);
    
    // 提取并可能修改 URL 组件
    let protocol = parsedUrl.protocol.slice(0, -1) || 'https';
    let hostname = parsedUrl.hostname;
    let pathname = parsedUrl.pathname;
    let search = parsedUrl.search;
    
    // 处理路径名
    if (pathname.charAt(pathname.length - 1) == '/') {
      pathname = pathname.slice(0, -1);
    }
    pathname += targetPath;
    
    // 构建新的 URL
    let newUrl = `${protocol}://${hostname}${pathname}${search}`;
    
    // 反向代理请求
    let response = await fetch(newUrl);
    
    // 获取响应数据
    const responseBody = await response.text();
    
    // 创建响应对象
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody
    };
  } catch (error) {
    console.error('Error in proxyUrl:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Proxy Error'
    };
  }
}

// 解析 URL 列表函数
async function parseUrls(content) {
  // 将制表符、双引号、单引号和换行符都替换为逗号
  // 然后将连续的多个逗号替换为单个逗号
  var processedContent = content.replace(/[\t|"'\r\n]+/g, ',').replace(/,+/g, ',');
  
  // 删除开头和结尾的逗号（如果有的话）
  if (processedContent.charAt(0) == ',') processedContent = processedContent.slice(1);
  if (processedContent.charAt(processedContent.length - 1) == ',') processedContent = processedContent.slice(0, processedContent.length - 1);
  
  // 使用逗号分割字符串，得到地址数组
  const urlArray = processedContent.split(',');
  
  return urlArray;
}