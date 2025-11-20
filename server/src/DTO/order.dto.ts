import { Types } from "mongoose";

export interface OrderDTO {
  _id?: string| Types.ObjectId;
  courseId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
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
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
