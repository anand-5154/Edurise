import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningPath extends Document {
  name: string;
  description: string;
  courses: mongoose.Types.ObjectId[];
}

const learningPathSchema = new Schema<ILearningPath>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
});

export default mongoose.model<ILearningPath>('LearningPath', learningPathSchema); 