import { Document, Types } from "mongoose";

export interface ILearningPathCourse {
  course: Types.ObjectId;
  note?: string;
  order: number;
  addedAt: Date;
}

export interface ILearningPath extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  targetDate?: Date;
  isArchived: boolean;
  courses: ILearningPathCourse[];
  createdAt: Date;
  updatedAt: Date;
}

export type LearningPathDocument = ILearningPath;

