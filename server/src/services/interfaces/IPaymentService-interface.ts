export interface IPaymentService {
  // Payment processing
  createOrder(amount: number, courseId: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
  }>;
  
  verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean>;
  
  // Enrollment management (separate from payment verification)
  createEnrollment(userId: string, courseId: string, amount: number): Promise<any>;
  checkExistingEnrollment(userId: string, courseId: string): Promise<boolean>;
  
  // Payment analytics
  getPaymentStats(): Promise<any>;
  getPaymentHistory(userId?: string): Promise<any[]>;
} 