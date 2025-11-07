import { Schema, Types } from "mongoose";

export interface IPopulatedCourse {
  _id: string;
  title: string;
}

export interface IOption {
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?:string,
  questionText: string;
  options: IOption[];
  explanation?: string;
}

export interface IQuiz extends Document {
  _id?:string
  courseId: Schema.Types.ObjectId | string | IPopulatedCourse
  instructorId: Schema.Types.ObjectId | string;
  title: string;
  description?: string;
  questions: IQuestion[];
  passPercentage: number;
  isDeleted:boolean
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizResult {
  _id?: string; 
  quizId: string; 
  userId: string; 
  courseId:string;
  answers: { [questionId: string]: string };
  score: number;
  percentage: number; 
  passed: boolean;
  isCertificateIssued?: boolean;
  createdAt?: Date;
}

export interface IInstructorQuizResponse {
  _id: string|Types.ObjectId;
  title: string;
  totalQuestions:number
  courseTitle: string;
  createdAt: Date;
}