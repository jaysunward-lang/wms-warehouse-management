import { Request, Response } from 'express';
import inventoryService from '../services/inventory.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class InventoryController {
  // 获取物料库存列表
  async getMaterialStockList(req: Request, res: Response) {
    try {
      const query = {
        keyword: req.query.keyword as string,
        category: req.query.category as string,
        location: req.query.location as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20
      };
      const result = await inventoryService.getMaterialStockList(query);
      return paginatedResponse(res, result.list, result.pagination);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取物料库存列表失败', 500, 500);
    }
  }

  // 获取物料详情
  async getMaterialDetail(req: Request, res: Response) {
    try {
      const materialId = parseInt(req.params.id);
      if (isNaN(materialId)) {
        return errorResponse(res, '无效的物料ID', 400, 400);
      }
      const result = await inventoryService.getMaterialDetail(materialId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取物料详情失败', 500, 500);
    }
  }

  // 创建物料
  async createMaterial(req: Request, res: Response) {
    try {
      const result = await inventoryService.createMaterial(req.body);
      return successResponse(res, result, '创建成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '创建物料失败', 500, 500);
    }
  }

  // 更新物料
  async updateMaterial(req: Request, res: Response) {
    try {
      const materialId = parseInt(req.params.id);
      if (isNaN(materialId)) {
        return errorResponse(res, '无效的物料ID', 400, 400);
      }
      const result = await inventoryService.updateMaterial(materialId, req.body);
      return successResponse(res, result, '更新成功');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '更新物料失败', 500, 500);
    }
  }

  // 删除物料
  async deleteMaterial(req: Request, res: Response) {
    try {
      const materialId = parseInt(req.params.id);
      if (isNaN(materialId)) {
        return errorResponse(res, '无效的物料ID', 400, 400);
      }
      const result = await inventoryService.deleteMaterial(materialId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '删除物料失败', 500, 500);
    }
  }

  // 获取多余库存列表
  async getExcessStockList(req: Request, res: Response) {
    try {
      const query = {
        keyword: req.query.keyword as string,
        location: req.query.location as string,
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 20
      };
      const result = await inventoryService.getExcessStockList(query);
      return paginatedResponse(res, result.list, result.pagination);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取多余库存列表失败', 500, 500);
    }
  }

  // 获取多余库存详情
  async getExcessStockDetail(req: Request, res: Response) {
    try {
      const excessId = parseInt(req.params.id);
      if (isNaN(excessId)) {
        return errorResponse(res, '无效的多余库存ID', 400, 400);
      }
      const result = await inventoryService.getExcessStockDetail(excessId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取多余库存详情失败', 500, 500);
    }
  }

  // 创建多余库存
  async createExcessStock(req: Request, res: Response) {
    try {
      const result = await inventoryService.createExcessStock(req.body);
      return successResponse(res, result, '创建成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '创建多余库存失败', 500, 500);
    }
  }

  // 更新多余库存
  async updateExcessStock(req: Request, res: Response) {
    try {
      const excessId = parseInt(req.params.id);
      if (isNaN(excessId)) {
        return errorResponse(res, '无效的多余库存ID', 400, 400);
      }
      const result = await inventoryService.updateExcessStock(excessId, req.body);
      return successResponse(res, result, '更新成功');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '更新多余库存失败', 500, 500);
    }
  }

  // 获取低库存预警
  async getLowStockAlerts(req: Request, res: Response) {
    try {
      const result = await inventoryService.getLowStockAlerts();
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取低库存预警失败', 500, 500);
    }
  }

  // 搜索库存
  async searchInventory(req: Request, res: Response) {
    try {
      const keyword = req.query.keyword as string;
      const type = (req.query.type as 'material' | 'excess') || 'material';
      if (!keyword) {
        return errorResponse(res, '请输入搜索关键词', 400, 400);
      }
      const result = await inventoryService.searchInventory(keyword, type);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '搜索失败', 500, 500);
    }
  }
}

export default new InventoryController();
