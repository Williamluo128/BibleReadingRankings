import app from '../server/src/index';

// Vercel serverless 入口:@vercel/node 会把 export default 的 Express app
// 自动适配为 serverless function 的请求 handler。
export default app;
