import mongoose, { Schema, Document } from 'mongoose';

export interface ILecture {
  title: string;
  videoUrl: string;
  description: string;
}

export interface IModule {
  title: string;
  lectures: ILecture[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  price: number;
  category: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  thumbnail: string;
  demoVideo: string;
  isPublished: boolean;
  modules: IModule[];
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new Schema<ILecture>({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const moduleSchema = new Schema<IModule>({
  title: { type: String, required: true },
  lectures: [lectureSchema]
}, { _id: false });

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  thumbnail: {
    type: String,
    required: true
  },
  demoVideo: {
    type: String,
    required: false
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  modules: [moduleSchema]
}, {
  timestamps: true
});

export default mongoose.model<ICourse>('Course', courseSchema); 