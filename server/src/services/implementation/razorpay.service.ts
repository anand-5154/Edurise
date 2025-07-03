// server/src/services/implementation/razorpay.service.ts
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (amount: number, receipt: string) => {
  return await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt,
  });
};

// For payment verification (optional, for after payment)
import crypto from 'crypto';
export const verifyPayment = (order_id: string, payment_id: string, signature: string) => {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!);
  hmac.update(order_id + '|' + payment_id);
  const generated_signature = hmac.digest('hex');
  return generated_signature === signature;
};