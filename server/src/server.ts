import { createServer } from 'http';
import app, { initializeApp } from './app';
import websocketService from './services/websocket.service';
import logger from './utils/logger';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 初始化应用
    await initializeApp();

    // 创建HTTP服务器
    const server = createServer(app);

    // 初始化WebSocket
    websocketService.initialize(server);

    // 启动服务器
    server.listen(PORT, () => {
      logger.info(`服务器运行在端口 ${PORT}`);
      logger.info(`API地址: http://localhost:${PORT}/api/v1`);
      logger.info(`健康检查: http://localhost:${PORT}/health`);
    });

    // 优雅关闭
    process.on('SIGTERM', () => {
      logger.info('收到SIGTERM信号，正在关闭服务器...');
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('收到SIGINT信号，正在关闭服务器...');
      server.close(() => {
        logger.info('服务器已关闭');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

startServer();
