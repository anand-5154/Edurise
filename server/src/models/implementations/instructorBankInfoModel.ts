import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructorBankInfo extends Document {
  instructor: mongoose.Types.ObjectId;
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  upiId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const instructorBankInfoSchema = new Schema<IInstructorBankInfo>({
  instructor: { type: Schema.Types.ObjectId, ref: 'Instructor', required: true, unique: true },
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifsc: { type: String, required: true },
  bankName: { type: String, required: true },
  upiId: { type: String },
}, { timestamps: true });

export default mongoose.model<IInstructorBankInfo>('InstructorBankInfo', instructorBankInfoSchema); 