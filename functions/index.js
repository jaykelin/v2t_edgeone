export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 检查是否为WebSocket升级请求
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader === 'websocket') {
    return handleWebSocketUpgrade(request, env, url);
  }

  // 所有请求都转发到URL环境变量指定的后端
  const REDIRECT_URL = env.URL;
  if (REDIRECT_URL) {
    return await 代理URL(REDIRECT_URL, url);
  }

  // 如果没有配置URL，则返回404
  return new Response('Not Found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// 处理WebSocket连接升级
async function handleWebSocketUpgrade(request, env, url) {
  const REDIRECT_URL = env.URL;
  if (REDIRECT_URL) {
    try {
      // 解析URL环境变量
      const backendUrl = new URL(REDIRECT_URL);
      
      // 创建目标WebSocket URL，保持完整路径
      const targetUrl = new URL(url);
      targetUrl.hostname = backendUrl.hostname;
      targetUrl.port = backendUrl.port;
      targetUrl.protocol = backendUrl.protocol === 'https:' ? 'wss:' : 'ws:';

      // 创建WebSocket对
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      // 接受客户端连接
      server.accept();

      // 连接到后端WebSocket服务器
      const backendResponse = await fetch(targetUrl.href, {
        headers: {
          'Upgrade': 'websocket',
          'Connection': 'Upgrade',
          ...request.headers
        }
      });

      // 获取后端WebSocket
      const backendWebSocket = backendResponse.webSocket;
      if (!backendWebSocket) {
        server.close(1011, "Backend WebSocket connection failed");
        return new Response("Backend WebSocket connection failed", { status: 502 });
      }

      // 接受后端连接
      backendWebSocket.accept();

      // 建立双向通信
      // 从客户端到后端
      server.addEventListener('message', event => {
        try {
          backendWebSocket.send(event.data);
        } catch (e) {
          console.error("Error sending message to backend:", e);
          server.close(1011, "Send error");
        }
      });

      // 从后端到客户端
      backendWebSocket.addEventListener('message', event => {
        try {
          server.send(event.data);
        } catch (e) {
          console.error("Error sending message to client:", e);
          backendWebSocket.close(1011, "Send error");
        }
      });

      // 处理关闭事件
      server.addEventListener('close', event => {
        try {
          backendWebSocket.close(event.code, event.reason);
        } catch (e) {
          console.error("Error closing backend WebSocket:", e);
        }
      });

      backendWebSocket.addEventListener('close', event => {
        try {
          server.close(event.code, event.reason);
        } catch (e) {
          console.error("Error closing client WebSocket:", e);
        }
      });

      // 处理错误事件
      server.addEventListener('error', () => {
        try {
          backendWebSocket.close(1011, "Client error");
        } catch (e) {
          console.error("Error closing backend WebSocket on client error:", e);
        }
      });

      backendWebSocket.addEventListener('error', () => {
        try {
          server.close(1011, "Backend error");
        } catch (e) {
          console.error("Error closing client WebSocket on backend error:", e);
        }
      });

      // 返回WebSocket连接给客户端
      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    } catch (e) {
      console.error(`Invalid URL in URL: "${REDIRECT_URL}"`, e);
      return new Response('WebSocket Upgrade Failed: ' + e.message, { status: 500 });
    }
  }

  // 如果没有配置URL，则返回错误
  return new Response('WebSocket Upgrade Failed: No backend URL configured', { status: 426 });
}

async function 代理URL(后端网址, 目标网址) {
  try {
    // 直接使用后端网址
    const 完整网址 = 后端网址;

    // 解析后端 URL
    let 后端URL = new URL(完整网址);
    
    // 构建目标 URL，保持完整路径
    let 新网址 = new URL(目标网址.toString());
    新网址.protocol = 后端URL.protocol;
    新网址.hostname = 后端URL.hostname;
    新网址.port = 后端URL.port;
    
    // 合并路径：后端URL路径 + 请求路径
    // 如果后端URL路径是根路径，则直接使用请求路径
    if (后端URL.pathname === '/') {
      新网址.pathname = 目标网址.pathname;
    } else {
      // 否则合并路径
      let 后端路径 = 后端URL.pathname;
      if (后端路径.endsWith('/') && 目标网址.pathname.startsWith('/')) {
        后端路径 = 后端路径.slice(0, -1);
      }
      新网址.pathname = 后端路径 + 目标网址.pathname;
    }

    // 创建代理请求，使用原始请求的所有信息
    const 代理请求 = new Request(新网址.toString(), 目标网址);

    // 反向代理请求
    let 响应 = await fetch(代理请求);

    // 创建新的响应
    let 新响应 = new Response(响应.body, {
        status: 响应.status,
        statusText: 响应.statusText,
        headers: 响应.headers
    });

    return 新响应;
  } catch (e) {
    return new Response('Proxy Error: ' + e.message, { status: 500 });
  }
}

