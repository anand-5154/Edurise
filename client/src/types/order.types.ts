export interface IOrder {
  _id?: string;
  courseId: string;
  userId: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  status: "created" | "paid" | "failed" | "cancelled";
  currency?: string;
  paymentMethod?: "razorpay" | "wallet";
  walletDebitTransactionId?: string;
  refundTransactionId?: string;
  refundAmount?: number;
  cancelledAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VerifyResponse {
  success: boolean;
  order: IOrder;
}