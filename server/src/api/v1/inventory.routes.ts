import { Router } from 'express';
import inventoryController from '../../controllers/inventory.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 物料库存相关
router.get('/materials', authMiddleware, inventoryController.getMaterialStockList);
router.get('/materials/:id', authMiddleware, inventoryController.getMaterialDetail);
router.post('/materials', authMiddleware, inventoryController.createMaterial);
router.put('/materials/:id', authMiddleware, inventoryController.updateMaterial);
router.delete('/materials/:id', authMiddleware, inventoryController.deleteMaterial);

// 多余库存相关
router.get('/excess', authMiddleware, inventoryController.getExcessStockList);
router.get('/excess/:id', authMiddleware, inventoryController.getExcessStockDetail);
router.post('/excess', authMiddleware, inventoryController.createExcessStock);
router.put('/excess/:id', authMiddleware, inventoryController.updateExcessStock);

// 库存搜索和预警
router.get('/search', authMiddleware, inventoryController.searchInventory);
router.get('/low-stock', authMiddleware, inventoryController.getLowStockAlerts);

export default router;
