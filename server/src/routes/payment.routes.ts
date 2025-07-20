// server/src/routes/payment.routes.ts
import { Router } from 'express';
import { PaymentController } from '../controllers/implementations/payment.controller';
import { PaymentService } from '../services/implementation/payment.service';
import { EnrollmentRepository } from '../repository/implementations/enrollment.repository';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Initialize dependencies
const enrollmentRepository = new EnrollmentRepository();
const paymentService = new PaymentService(enrollmentRepository);
const paymentController = new PaymentController(paymentService);

// Public routes
router.post('/orders', paymentController.createRazorpayOrder.bind(paymentController));

// Protected routes
router.post('/verify', authMiddleware, paymentController.verifyRazorpayPayment.bind(paymentController));
router.get('/stats', authMiddleware, paymentController.getPaymentStats.bind(paymentController));
router.get('/history', authMiddleware, paymentController.getPaymentHistory.bind(paymentController));

export default router;