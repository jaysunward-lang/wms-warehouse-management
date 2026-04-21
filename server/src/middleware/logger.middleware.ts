import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent') || 'unknown'
    };
    
    if (res.statusCode >= 400) {
      logger.warn('请求处理完成', logData);
    } else {
      logger.info('请求处理完成', logData);
    }
  });
  
  next();
};
