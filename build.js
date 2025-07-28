const fs = require('fs');
const path = require('path');

// 创建 build 目录
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// 复制 edgeone.json 到 build 目录
const edgeoneSrc = path.join(__dirname, 'edgeone.json');
const edgeoneDest = path.join(buildDir, 'edgeone.json');
fs.copyFileSync(edgeoneSrc, edgeoneDest);

// 创建 build/functions 目录
const functionsDir = path.join(buildDir, 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir);
}

// 复制 functions/index.js 到 build/functions 目录
const indexSrc = path.join(__dirname, 'functions', 'index.js');
const indexDest = path.join(functionsDir, 'index.js');
fs.copyFileSync(indexSrc, indexDest);

console.log('Build completed successfully!');
console.log('Generated files:');
console.log('- build/edgeone.json');
console.log('- build/functions/index.js');