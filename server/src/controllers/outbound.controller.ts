import { Request, Response } from 'express';
import outboundService from '../services/outbound.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class OutboundController {
  // 获取出库记录列表
  async getOutboundList(req: Request, res: Response) {
    try {
      const query = {
        materialId: req.query.materialId ? parseInt(req.query.materialId as string) : undefined,
        type: req.query.type as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20
      };
      const result = await outboundService.getOutboundList(query, req.user?.userId);
      return paginatedResponse(res, result.list, result.pagination);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取出库记录列表失败', 500, 500);
    }
  }

  // 获取出库记录详情
  async getOutboundDetail(req: Request, res: Response) {
    try {
      const outboundId = parseInt(req.params.id);
      if (isNaN(outboundId)) {
        return errorResponse(res, '无效的出库记录ID', 400, 400);
      }
      const result = await outboundService.getOutboundDetail(outboundId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取出库记录详情失败', 500, 500);
    }
  }

  // 物料出库
  async materialOutbound(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await outboundService.materialOutbound(req.body, operator);
      return successResponse(res, result, '出库成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '物料出库失败', 500, 500);
    }
  }

  // 多余库存出库
  async excessOutbound(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await outboundService.excessOutbound(req.body, operator);
      return successResponse(res, result, '多余库存出库成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '多余库存出库失败', 500, 500);
    }
  }

  // 删除出库记录
  async deleteOutbound(req: Request, res: Response) {
    try {
      const outboundId = parseInt(req.params.id);
      if (isNaN(outboundId)) {
        return errorResponse(res, '无效的出库记录ID', 400, 400);
      }
      const result = await outboundService.deleteOutbound(outboundId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '删除出库记录失败', 500, 500);
    }
  }
}

export default new OutboundController();
