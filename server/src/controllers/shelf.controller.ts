import { Request, Response } from 'express';
import shelfService from '../services/shelf.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class ShelfController {
  // 获取上下架记录列表
  async getShelfRecordList(req: Request, res: Response) {
    try {
      const query = {
        materialId: req.query.materialId ? parseInt(req.query.materialId as string) : undefined,
        action: req.query.action as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20
      };
      const result = await shelfService.getShelfRecordList(query);
      return paginatedResponse(res, result.list, result.pagination);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取上下架记录列表失败', 500, 500);
    }
  }

  // 获取上下架记录详情
  async getShelfRecordDetail(req: Request, res: Response) {
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) {
        return errorResponse(res, '无效的上下架记录ID', 400, 400);
      }
      const result = await shelfService.getShelfRecordDetail(recordId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取上下架记录详情失败', 500, 500);
    }
  }

  // 上架操作
  async shelfUp(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await shelfService.shelfUp(req.body, operator);
      return successResponse(res, result, '上架成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '上架失败', 500, 500);
    }
  }

  // 下架操作
  async shelfDown(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await shelfService.shelfDown(req.body, operator);
      return successResponse(res, result, '下架成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '下架失败', 500, 500);
    }
  }

  // 库位转移
  async shelfTransfer(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await shelfService.shelfTransfer(req.body, operator);
      return successResponse(res, result, '库位转移成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '库位转移失败', 500, 500);
    }
  }

  // 盘点调整
  async shelfAdjust(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await shelfService.shelfAdjust(req.body, operator);
      return successResponse(res, result, '盘点调整成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '盘点调整失败', 500, 500);
    }
  }

  // 获取库位信息
  async getLocations(req: Request, res: Response) {
    try {
      const result = await shelfService.getLocations();
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取库位信息失败', 500, 500);
    }
  }
}

export default new ShelfController();
