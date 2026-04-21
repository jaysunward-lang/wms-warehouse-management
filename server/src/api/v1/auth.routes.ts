import { Router } from 'express';
import authController from '../../controllers/auth.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// 公开接口
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的接口
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/password', authMiddleware, authController.changePassword);

export default router;
