import { ICourse } from '../../models/interfaces/course.interface';
import { IInstructor } from '../../models/interfaces/instructorAuth.interface';
import { IModule } from '../../models/implementations/moduleModel';
import { ILecture } from '../../models/implementations/lectureModel';

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  totalMessages: number;
  recentCourses: {
    id: string;
    title: string;
    students: number;
    rating: number;
  }[];
  recentMessages: {
    id: string;
    studentName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface IInstructorService {
  createCourse(instructorId: string, courseData: Partial<ICourse>): Promise<ICourse>;
  getDashboardStats(instructorId: string): Promise<DashboardStats>;
  getCourses(instructorId: string): Promise<ICourse[]>;
  getCourseById(instructorId: string, courseId: string): Promise<ICourse | null>;
  updateCourse(instructorId: string, courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null>;
  createModule(courseId: string, moduleData: Partial<IModule>): Promise<IModule>;
  updateModule(moduleId: string, update: Partial<IModule>): Promise<IModule | null>;
  deleteModule(moduleId: string): Promise<void>;
  getModules(courseId: string): Promise<IModule[]>;
  reorderModules(courseId: string, moduleOrder: string[]): Promise<void>;

  createLecture(moduleId: string, lectureData: Partial<ILecture>): Promise<ILecture>;
  updateLecture(lectureId: string, update: Partial<ILecture>): Promise<ILecture | null>;
  deleteLecture(lectureId: string): Promise<void>;
  getLectures(moduleId: string): Promise<ILecture[]>;
  reorderLectures(moduleId: string, lectureOrder: string[]): Promise<void>;
} 