import { ILearningPath } from "../../models/interfaces/IlearningPath.interface";

export interface CreateLearningPathPayload {
  title: string;
  description?: string;
  targetDate?: Date | null;
  courses?: { courseId: string; note?: string }[];
}

export interface UpdateLearningPathPayload {
  title?: string;
  description?: string;
  targetDate?: Date | null;
  isArchived?: boolean;
}

export interface ILearningPathRepository {
  createPath(
    userId: string,
    payload: CreateLearningPathPayload
  ): Promise<ILearningPath>;
  listPaths(userId: string): Promise<ILearningPath[]>;
  findById(pathId: string, userId: string): Promise<ILearningPath | null>;
  updatePath(
    pathId: string,
    userId: string,
    payload: UpdateLearningPathPayload
  ): Promise<ILearningPath | null>;
  deletePath(pathId: string, userId: string): Promise<boolean>;
  addCourse(
    pathId: string,
    userId: string,
    courseId: string,
    note?: string
  ): Promise<ILearningPath | null>;
  removeCourse(
    pathId: string,
    userId: string,
    courseId: string
  ): Promise<ILearningPath | null>;
  reorderCourses(
    pathId: string,
    userId: string,
    orderedCourseIds: string[]
  ): Promise<ILearningPath | null>;
}

