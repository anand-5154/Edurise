import { ICourse } from '../../models/interfaces/course.interface';

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
} 