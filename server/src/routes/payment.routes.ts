// server/src/routes/payment.routes.ts
import { Router } from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/implementations/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/orders', createRazorpayOrder);
router.post('/verify', authMiddleware, verifyRazorpayPayment);

export default router;