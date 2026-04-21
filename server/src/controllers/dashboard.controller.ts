import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class DashboardController {
  // 获取统计数据
  async getStats(req: Request, res: Response) {
    try {
      const result = await dashboardService.getStats();
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取统计数据失败', 500, 500);
    }
  }

  // 获取图表数据
  async getCharts(req: Request, res: Response) {
    try {
      const result = await dashboardService.getCharts();
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取图表数据失败', 500, 500);
    }
  }

  // 获取库存预警
  async getAlerts(req: Request, res: Response) {
    try {
      const result = await dashboardService.getAlerts();
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取库存预警失败', 500, 500);
    }
  }

  // 获取最近活动
  async getActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await dashboardService.getActivities(limit);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取最近活动失败', 500, 500);
    }
  }
}

export default new DashboardController();
