# v2tunnel for EdgeOne Pages

这是一个可以在腾讯云 EdgeOne Pages 上运行的反向代理服务，功能类似于 Cloudflare Workers 版本。

## 功能特性

1. **后端服务转发**：根据路径将请求转发到不同的后端服务
2. **首页重定向**：将根路径请求重定向到指定 URL
3. **环境变量配置**：通过环境变量配置后端服务和重定向 URL

## 部署到 EdgeOne Pages

1. 将代码推送到您的代码仓库
2. 在 EdgeOne Pages 控制台创建新项目
3. 选择您的代码仓库并配置构建设置
4. 设置环境变量：
   - `BACKEND_URL`: 配置后端服务 URL，每行一个
   - `URL`: 首页重定向的目标 URL

## 本地开发

```bash
npm install
npm run dev
```

## 环境变量配置

### BACKEND_URL 格式
```
https://api.example1.com/api/
https://api.example2.com/v1/
```

每个 URL 占一行，请求路径会根据配置的路径前缀进行匹配转发。

### URL
首页重定向的目标 URL，例如：`https://www.example.com`

## API 端点

- `/*` - 所有路径都会根据配置进行转发或返回 404

## 注意事项

1. EdgeOne Pages 的环境变量配置方式可能与 Cloudflare Workers 不同，请参考官方文档进行设置
2. 请确保您的后端服务允许跨域请求（如果需要的话）