import mongoose, { Schema, Document } from 'mongoose';

export interface ILectureProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  lecture: mongoose.Types.ObjectId;
  completedAt: Date;
}

const lectureProgressSchema = new Schema<ILectureProgress>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  module: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
  lecture: { type: Schema.Types.ObjectId, ref: 'Lecture', required: true },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ILectureProgress>('LectureProgress', lectureProgressSchema); 