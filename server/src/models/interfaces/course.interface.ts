import { Document, Types } from 'mongoose';

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
  instructor: Types.ObjectId;
  price: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  thumbnail: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  modules: IModule[];
} 