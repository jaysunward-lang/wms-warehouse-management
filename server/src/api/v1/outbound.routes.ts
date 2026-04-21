import { Router } from 'express';
import outboundController from '../../controllers/outbound.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 出库记录列表
router.get('/', authMiddleware, outboundController.getOutboundList);

// 出库记录详情
router.get('/:id', authMiddleware, outboundController.getOutboundDetail);

// 物料出库
router.post('/material', authMiddleware, outboundController.materialOutbound);

// 多余库存出库
router.post('/excess', authMiddleware, outboundController.excessOutbound);

// 删除出库记录
router.delete('/:id', authMiddleware, outboundController.deleteOutbound);

export default router;
