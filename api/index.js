// Vercel serverless 入口:使用 esbuild 打包的单文件 handler(CommonJS)
const app = require('./handler.cjs');

module.exports = app.default ?? app;
