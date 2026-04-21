import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response';
import { AppError } from '../middleware/error.middleware';

export class AuthController {
  // 用户注册
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, '注册成功', 201);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '注册失败', 500, 500);
    }
  }

  // 用户登录
  async login(req: Request, res: Response) {
    try {
      const ip = req.ip;
      const result = await authService.login(req.body, ip);
      return successResponse(res, result, '登录成功');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '登录失败', 500, 500);
    }
  }

  // 获取用户信息
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const result = await authService.getProfile(userId);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '获取用户信息失败', 500, 500);
    }
  }

  // 更新用户信息
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const result = await authService.updateProfile(userId, req.body);
      return successResponse(res, result, '更新成功');
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '更新失败', 500, 500);
    }
  }

  // 修改密码
  async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return errorResponse(res, '未授权', 401, 401);
      }
      const { oldPassword, newPassword } = req.body;
      const result = await authService.changePassword(userId, oldPassword, newPassword);
      return successResponse(res, result);
    } catch (error) {
      if (error instanceof AppError) {
        return errorResponse(res, error.message, error.code, error.statusCode);
      }
      return errorResponse(res, '修改密码失败', 500, 500);
    }
  }
}

export default new AuthController();
