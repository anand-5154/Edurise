import mongoose, { Schema, Document } from 'mongoose';

export interface IModule extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new Schema<IModule>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model<IModule>('Module', moduleSchema); 