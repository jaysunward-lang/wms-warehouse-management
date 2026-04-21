import { Request, Response } from 'express';
import inboundService from '../services/inbound.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class InboundController {
  // 获取入库记录列表
  async getInboundList(req: Request, res: Response) {
    try {
      const query = {
        materialId: req.query.materialId ? parseInt(req.query.materialId as string) : undefined,
        type: req.query.type as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20
      };
      const result = await inboundService.getInboundList(query, req.user?.userId);
      return paginatedResponse(res, result.list, result.pagination);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取入库记录列表失败', 500, 500);
    }
  }

  // 获取入库记录详情
  async getInboundDetail(req: Request, res: Response) {
    try {
      const inboundId = parseInt(req.params.id);
      if (isNaN(inboundId)) {
        return errorResponse(res, '无效的入库记录ID', 400, 400);
      }
      const result = await inboundService.getInboundDetail(inboundId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取入库记录详情失败', 500, 500);
    }
  }

  // 物料入库
  async materialInbound(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await inboundService.materialInbound(req.body, operator);
      return successResponse(res, result, '入库成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '物料入库失败', 500, 500);
    }
  }

  // 多余库存入库
  async excessInbound(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const operator = { userId: user.userId, realName: user.realName };
      const result = await inboundService.excessInbound(req.body, operator);
      return successResponse(res, result, '多余库存入库成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '多余库存入库失败', 500, 500);
    }
  }

  // 删除入库记录
  async deleteInbound(req: Request, res: Response) {
    try {
      const inboundId = parseInt(req.params.id);
      if (isNaN(inboundId)) {
        return errorResponse(res, '无效的入库记录ID', 400, 400);
      }
      const result = await inboundService.deleteInbound(inboundId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '删除入库记录失败', 500, 500);
    }
  }
}

export default new InboundController();
