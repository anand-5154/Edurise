import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  review: {
    type: String
  }
}, {
  timestamps: true
});

// Create a compound index to ensure a student can only enroll in a course once
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema); 