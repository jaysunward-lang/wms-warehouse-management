import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDatabase } from './config/database';
import { syncDatabase } from './models';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';
import { loggerMiddleware } from './middleware/logger.middleware';
import apiRoutes from './api/v1';
import logger from './utils/logger';

// 加载环境变量
dotenv.config();

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 每个IP 1000次请求
  message: '请求过于频繁，请稍后再试'
});
app.use(limiter);

// 日志中间件
app.use(loggerMiddleware);

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API路由
app.use('/api/v1', apiRoutes);

// 404处理
app.use(notFoundMiddleware);

// 错误处理
app.use(errorMiddleware);

// 数据库连接和同步
export const initializeApp = async () => {
  try {
    // 连接数据库
    await connectDatabase();
    
    // 同步数据库模型（开发环境使用，生产环境建议使用迁移）
    if (process.env.NODE_ENV !== 'production') {
      await syncDatabase();
    }
    
    logger.info('应用初始化完成');
    return app;
  } catch (error) {
    logger.error('应用初始化失败:', error);
    throw error;
  }
};

export default app;
