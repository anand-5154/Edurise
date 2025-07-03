import mongoose, { Schema, Document } from 'mongoose';

export interface ILectureProgress extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lectureIndex: number;
  completedAt: Date;
}

const lectureProgressSchema = new Schema<ILectureProgress>({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  lectureIndex: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

lectureProgressSchema.index({ student: 1, course: 1, lectureIndex: 1 }, { unique: true });

export default mongoose.model<ILectureProgress>('LectureProgress', lectureProgressSchema); 