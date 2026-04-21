import { Router } from 'express';
import dashboardController from '../../controllers/dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 统计数据
router.get('/stats', authMiddleware, dashboardController.getStats);

// 图表数据
router.get('/charts', authMiddleware, dashboardController.getCharts);

// 库存预警
router.get('/alerts', authMiddleware, dashboardController.getAlerts);

// 最近活动
router.get('/activities', authMiddleware, dashboardController.getActivities);

export default router;
