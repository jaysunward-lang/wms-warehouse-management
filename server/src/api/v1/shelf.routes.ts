import { Router } from 'express';
import shelfController from '../../controllers/shelf.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 上下架记录列表
router.get('/', authMiddleware, shelfController.getShelfRecordList);

// 上下架记录详情
router.get('/:id', authMiddleware, shelfController.getShelfRecordDetail);

// 上架操作
router.post('/up', authMiddleware, shelfController.shelfUp);

// 下架操作
router.post('/down', authMiddleware, shelfController.shelfDown);

// 库位转移
router.post('/transfer', authMiddleware, shelfController.shelfTransfer);

// 盘点调整
router.post('/adjust', authMiddleware, shelfController.shelfAdjust);

// 获取库位信息
router.get('/locations', authMiddleware, shelfController.getLocations);

export default router;
