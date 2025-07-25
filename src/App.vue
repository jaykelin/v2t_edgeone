<template>
  <div id="app">
    <header>
      <h1>v2tunnel for EdgeOne Pages</h1>
    </header>
    
    <main>
      <div class="container">
        <h2>使用说明</h2>
        <p>请在 EdgeOne Pages 控制台设置以下环境变量：</p>
        <ul>
          <li><code>BACKEND_URL</code>: 配置后端服务 URL，每行一个</li>
        </ul>
        <p>如果配置了 <code>BACKEND_URL</code>，请求将根据路径前缀转发到相应的后端服务。</p>
        <p>首页重定向可通过 <code>edgeone.json</code> 配置文件中的 <code>redirects</code> 字段设置。</p>
      </div>
      
      <div class="container">
        <h2>当前状态</h2>
        <p>如果看到此页面，说明环境变量可能未正确设置或未生效。</p>
        <p>请检查 EdgeOne Pages 控制台中的环境变量配置。</p>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  line-height: 1.6;
}

header {
  text-align: center;
  margin-bottom: 30px;
}

.container {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

code {
  background-color: #eaeaea;
  padding: 2px 4px;
  border-radius: 4px;
}

ul {
  text-align: left;
}
</style>