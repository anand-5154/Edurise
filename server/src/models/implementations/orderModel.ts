import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  razorpayOrderId: {type:String},
  razorpayPaymentId: {type:String},
  razorpaySignature: {type:String},
  amount: {type:Number},
  status: { type: String, enum: ['created', 'paid', 'failed', 'cancelled'], default: 'created' },
  paymentMethod: { type: String, enum: ['razorpay', 'wallet'], default: 'razorpay' },
  walletDebitTransactionId: { type: String },
  refundTransactionId: { type: String },
  refundAmount: { type: Number, default: 0 },
  cancelledAt: { type: Date },
}, {
  timestamps: true
});

orderSchema.index({ userId: 1, courseId: 1, status: 1 });

export default mongoose.model('Order', orderSchema);
