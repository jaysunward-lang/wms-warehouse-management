import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import logger from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public code: number;

  constructor(message: string, statusCode = 500, code = 500) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof AppError) {
    logger.warn(`应用错误: ${error.message}`, { 
      path: req.path, 
      method: req.method,
      code: error.code 
    });
    return errorResponse(res, error.message, error.code, error.statusCode);
  }

  logger.error(`服务器错误: ${error.message}`, {
    path: req.path,
    method: req.method,
    stack: error.stack
  });

  return errorResponse(res, '服务器内部错误', 500, 500);
};

export const notFoundMiddleware = (req: Request, res: Response) => {
  return errorResponse(res, `接口 ${req.originalUrl} 不存在`, 404, 404);
};
