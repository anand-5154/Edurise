// server/src/controllers/implementations/payment.controller.ts
import { Request, Response } from 'express';
import { IPaymentService } from '../../services/interfaces/payment.interface';
import { httpStatus } from '../../constants/statusCodes';

export class PaymentController {
  constructor(private _paymentService: IPaymentService) {}

  async createRazorpayOrder(req: Request, res: Response): Promise<void> {
  try {
    const { amount, courseId } = req.body;
      
      if (!amount || !courseId) {
        res.status(httpStatus.BAD_REQUEST).json({ 
          error: 'Amount and courseId are required' 
        });
        return;
      }

      const order = await this._paymentService.createOrder(amount, courseId);
      res.json(order);
  } catch (err: any) {
    console.error('Razorpay order error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        error: 'Failed to create order', 
        details: err.message 
      });
  }
  }

  async verifyRazorpayPayment(req: Request, res: Response): Promise<void> {
    try {
  const { order_id, payment_id, signature, courseId } = req.body;
      const userId = (req.user as { id: string })?.id;

      // Validate required fields
      if (!order_id || !payment_id || !signature || !courseId) {
        res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Missing required payment parameters' 
        });
        return;
      }

      if (!userId) {
        res.status(httpStatus.UNAUTHORIZED).json({ 
          success: false, 
          error: 'User not authenticated' 
        });
        return;
      }

      // Verify payment signature
      const isValid = await this._paymentService.verifyPayment(order_id, payment_id, signature);
      
      if (!isValid) {
        res.status(httpStatus.BAD_REQUEST).json({ 
          success: false, 
          error: 'Invalid payment signature' 
        });
        return;
      }

      // Check if user is already enrolled
      const isAlreadyEnrolled = await this._paymentService.checkExistingEnrollment(userId, courseId);
      if (isAlreadyEnrolled) {
        res.status(httpStatus.CONFLICT).json({ 
          success: false, 
          error: 'User already enrolled in this course' 
        });
        return;
      }

      // Create enrollment
      const amount = req.body.amount || 0;
      await this._paymentService.createEnrollment(userId, courseId, amount);

      res.json({ success: true });
    } catch (err: any) {
      console.error('Payment verification error:', err);
      
      if (err.message === 'User already enrolled in this course') {
        res.status(httpStatus.CONFLICT).json({ 
          success: false, 
          error: err.message 
        });
      } else {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
          success: false, 
          error: 'Payment verification failed', 
          details: err.message 
        });
    }
    }
  }

  async getPaymentStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this._paymentService.getPaymentStats();
      res.json(stats);
    } catch (err: any) {
      console.error('Payment stats error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        error: 'Failed to get payment statistics' 
      });
    }
  }

  async getPaymentHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const history = await this._paymentService.getPaymentHistory(userId);
      res.json(history);
    } catch (err: any) {
      console.error('Payment history error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        error: 'Failed to get payment history' 
      });
  }
  }
}