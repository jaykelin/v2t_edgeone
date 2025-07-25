export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 根据请求路径匹配相应的后端进行转发。
  if (env.BACKEND_URL) {
    // 按行分割，并过滤掉空行
    const backendUrls = env.BACKEND_URL.trim().split('\n').filter(line => line.trim() !== '');

    for (const backendUrlString of backendUrls) {
      try {
        // 解析每行的 URL
        const backendUrl = new URL(backendUrlString.trim());
        const pathToMatch = backendUrl.pathname;

        // 如果请求路径以配置的路径开头，则进行转发
        // 例如，请求 /api/users/123 会匹配配置的 https://backend.com/api/
        if (pathname.startsWith(pathToMatch)) {
          // 创建一个新的 URL 对象用于转发
          const targetUrl = new URL(request.url);
          
          // 设置转发目标的主机、端口和协议
          targetUrl.hostname = backendUrl.hostname;
          targetUrl.port = backendUrl.port;
          targetUrl.protocol = backendUrl.protocol;

          // 创建新请求，并保留原始请求的所有信息
          const newRequest = new Request(targetUrl, request);

          try {
            // 发送请求到后端并返回响应
            return await fetch(newRequest);
          } catch (e) {
            return new Response(e.stack || e, { status: 500 });
          }
        }
      } catch (e) {
        // 如果 BACKEND_URL 中有无效的 URL，打印错误并忽略，以避免单行配置错误影响整个服务
        console.error(`Invalid URL in BACKEND_URL: "${backendUrlString}"`, e);
      }
    }
  }

  // 2. 检查是否为首页，并执行跳转
  const REDIRECT_URL = env.URL;
  if (REDIRECT_URL && pathname === '/') {
    // 返回 302 临时重定向
    //return Response.redirect(REDIRECT_URL, 302);
    return await 代理URL(REDIRECT_URL, url);
  }

  // 3. 如果路径不匹配 WS_PATH，也不是首页跳转，则返回 404
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

async function 代理URL(代理网址, 目标网址) {
  const 网址列表 = await 整理(代理网址);
  const 完整网址 = 网址列表[Math.floor(Math.random() * 网址列表.length)];

  // 解析目标 URL
  let 解析后的网址 = new URL(完整网址);
  console.log(解析后的网址);
  // 提取并可能修改 URL 组件
  let 协议 = 解析后的网址.protocol.slice(0, -1) || 'https';
  let 主机名 = 解析后的网址.hostname;
  let 路径名 = 解析后的网址.pathname;
  let 查询参数 = 解析后的网址.search;

  // 处理路径名
  if (路径名.charAt(路径名.length - 1) == '/') {
      路径名 = 路径名.slice(0, -1);
  }
  路径名 += 目标网址.pathname;

  // 构建新的 URL
  let 新网址 = `${协议}://${主机名}${路径名}${查询参数}`;

  // 反向代理请求
  let 响应 = await fetch(新网址);

  // 创建新的响应
  let 新响应 = new Response(响应.body, {
      status: 响应.status,
      statusText: 响应.statusText,
      headers: 响应.headers
  });

  // 添加自定义头部，包含 URL 信息
  //新响应.headers.set('X-Proxied-By', 'Cloudflare Worker');
  //新响应.headers.set('X-Original-URL', 完整网址);
  新响应.headers.set('X-New-URL', 新网址);

  return 新响应;
}

async function 整理(内容) {
  // 将制表符、双引号、单引号和换行符都替换为逗号
  // 然后将连续的多个逗号替换为单个逗号
  var 替换后的内容 = 内容.replace(/[\t|"'\r\n]+/g, ',').replace(/,+/g, ',');

  // 删除开头和结尾的逗号（如果有的话）
  if (替换后的内容.charAt(0) == ',') 替换后的内容 = 替换后的内容.slice(1);
  if (替换后的内容.charAt(替换后的内容.length - 1) == ',') 替换后的内容 = 替换后的内容.slice(0, 替换后的内容.length - 1);

  // 使用逗号分割字符串，得到地址数组
  const 地址数组 = 替换后的内容.split(',');

  return 地址数组;
}