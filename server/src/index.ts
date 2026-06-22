import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env, ensureEnv } from './config/env';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

// 环境变量校验放在请求阶段,避免模块加载时崩溃导致 Vercel FUNCTION_INVOCATION_FAILED
app.use((req, res, next) => {
  try {
    ensureEnv();
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server configuration error',
    });
  }
});

// Security middleware
app.use(helmet());

// CORS configuration
function isAllowedCorsOrigin(origin: string): boolean {
  if (env.CORS_ORIGIN.includes(origin)) {
    return true;
  }

  if (env.NODE_ENV === 'development' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
    return true;
  }

  // Vercel 生产/预览域名 (*.vercel.app)
  if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
    return true;
  }

  return false;
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedCorsOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`[cors] rejected origin: ${origin}`);
    // 用 false 拒绝,避免 callback(Error) 触发 500
    callback(null, false);
  },
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
// 仅在非生产环境(本地开发)启动长驻 HTTP 服务器;
// 生产环境(Vercel serverless)由 api/index.ts 导出的 handler 处理请求。
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`📊 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 API URL: http://localhost:${env.PORT}/api`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

export default app;