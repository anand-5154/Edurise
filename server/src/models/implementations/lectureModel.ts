import mongoose, { Schema, Document } from 'mongoose';

export interface ILecture extends Document {
  module: mongoose.Types.ObjectId;
  title: string;
  videoUrl: string;
  description: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new Schema<ILecture>({
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<ILecture>('Lecture', lectureSchema); 