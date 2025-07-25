import { Document, Types } from 'mongoose';

export interface IInstructorBankInfo extends Document {
  instructor: Types.ObjectId;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
} 