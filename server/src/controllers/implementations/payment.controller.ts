// server/src/controllers/implementations/payment.controller.ts
import { Request, Response } from 'express';
import { createOrder, verifyPayment } from '../../services/implementation/razorpay.service';
import Enrollment from '../../models/implementations/enrollmentModel';

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount, courseId } = req.body;
    // Ensure receipt is always <= 40 chars
    const shortCourseId = String(courseId).slice(0, 20);
    const receipt = `rcpt_${shortCourseId}_${Date.now()}`.slice(0, 40);
    const order = await createOrder(amount, receipt);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    console.error('Razorpay order error:', err);
    res.status(500).json({ error: 'Failed to create order', details: err && err.message ? err.message : err });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  const { order_id, payment_id, signature, courseId } = req.body;
  const isValid = verifyPayment(order_id, payment_id, signature);
  if (isValid) {
    try {
      const userId = (req.user as { id: string })?.id;
      if (!userId) return res.status(401).json({ success: false, error: 'User not authenticated' });
      if (!courseId) return res.status(400).json({ success: false, error: 'Course ID missing' });

      // Create enrollment (status: completed)
      await Enrollment.create({
        student: userId,
        course: courseId,
        amount: req.body.amount || 0,
        status: 'completed',
      });

      res.json({ success: true });
    } catch (err) {
      console.error('Enrollment error:', err);
      res.status(500).json({ success: false, error: 'Enrollment failed', details: err });
    }
  } else {
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
};