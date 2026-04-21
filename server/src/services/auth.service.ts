import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateToken, TokenPayload } from '../utils/jwt';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

export interface RegisterData {
  username: string;
  password: string;
  realName: string;
  phone?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    userId: number;
    username: string;
    realName: string;
    phone?: string;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  // 用户注册
  async register(data: RegisterData): Promise<AuthResponse> {
    const { username, password, realName, phone } = data;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      throw new AppError('用户名已存在', 400, 400);
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      realName,
      phone,
      status: 1
    });

    // 生成Token
    const tokenPayload: TokenPayload = {
      userId: user.userId,
      username: user.username,
      realName: user.realName
    };

    const token = generateToken(tokenPayload);

    logger.info(`用户注册成功: ${username}`);

    return {
      user: {
        userId: user.userId,
        username: user.username,
        realName: user.realName,
        phone: user.phone
      },
      token,
      refreshToken: token
    };
  }

  // 用户登录
  async login(data: LoginData, ip?: string): Promise<AuthResponse> {
    const { username, password } = data;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new AppError('用户名或密码错误', 401, 401);
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new AppError('账号已被禁用', 403, 403);
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('用户名或密码错误', 401, 401);
    }

    // 更新登录信息
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: ip
    });

    // 生成Token
    const tokenPayload: TokenPayload = {
      userId: user.userId,
      username: user.username,
      realName: user.realName
    };

    const token = generateToken(tokenPayload);

    logger.info(`用户登录成功: ${username}, IP: ${ip}`);

    return {
      user: {
        userId: user.userId,
        username: user.username,
        realName: user.realName,
        phone: user.phone
      },
      token,
      refreshToken: token
    };
  }

  // 获取用户信息
  async getProfile(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: ['userId', 'username', 'realName', 'phone', 'status', 'lastLoginAt', 'createdAt']
    });

    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    return user;
  }

  // 更新用户信息
  async updateProfile(userId: number, data: Partial<RegisterData>) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    const updateData: any = {};
    if (data.realName) updateData.realName = data.realName;
    if (data.phone) updateData.phone = data.phone;

    await user.update(updateData);

    return {
      userId: user.userId,
      username: user.username,
      realName: user.realName,
      phone: user.phone
    };
  }

  // 修改密码
  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('用户不存在', 404, 404);
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('原密码错误', 400, 400);
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    logger.info(`用户修改密码成功: ${user.username}`);

    return { message: '密码修改成功' };
  }
}

export default new AuthService();
