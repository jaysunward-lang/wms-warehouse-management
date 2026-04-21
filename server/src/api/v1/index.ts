import { Router } from 'express';
import authRoutes from './auth.routes';
import inventoryRoutes from './inventory.routes';
import inboundRoutes from './inbound.routes';
import outboundRoutes from './outbound.routes';
import shelfRoutes from './shelf.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

// 认证相关
router.use('/auth', authRoutes);

// 库存相关
router.use('/inventory', inventoryRoutes);

// 入库相关
router.use('/inbound', inboundRoutes);

// 出库相关
router.use('/outbound', outboundRoutes);

// 上下架相关
router.use('/shelf', shelfRoutes);

// 仪表板相关
router.use('/dashboard', dashboardRoutes);

export default router;
