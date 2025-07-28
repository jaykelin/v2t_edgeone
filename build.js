const fs = require('fs');
const path = require('path');

// 创建 buid 目录（注意：这里是 "buid" 而不是 "build"）
const buildDir = path.join(__dirname, 'buid');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// 复制 edgeone.json 到 buid 目录
const edgeoneSrc = path.join(__dirname, 'edgeone.json');
const edgeoneDest = path.join(buildDir, 'edgeone.json');
fs.copyFileSync(edgeoneSrc, edgeoneDest);

// 创建 buid/functions 目录
const functionsDir = path.join(buildDir, 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir);
}

// 复制 functions/index.js 到 buid/functions 目录
const indexSrc = path.join(__dirname, 'functions', 'index.js');
const indexDest = path.join(functionsDir, 'index.js');
fs.copyFileSync(indexSrc, indexDest);

console.log('Build completed successfully!');
console.log('Generated files:');
console.log('- buid/edgeone.json');
console.log('- buid/functions/index.js');