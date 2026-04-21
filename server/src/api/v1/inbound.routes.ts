import { Router } from 'express';
import inboundController from '../../controllers/inbound.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 入库记录列表
router.get('/', authMiddleware, inboundController.getInboundList);

// 入库记录详情
router.get('/:id', authMiddleware, inboundController.getInboundDetail);

// 物料入库
router.post('/material', authMiddleware, inboundController.materialInbound);

// 多余库存入库
router.post('/excess', authMiddleware, inboundController.excessInbound);

// 删除入库记录
router.delete('/:id', authMiddleware, inboundController.deleteInbound);

export default router;
