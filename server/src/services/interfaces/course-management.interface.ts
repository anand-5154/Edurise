import { ICourse } from '../../models/interfaces/course.interface';
import { GetAllCoursesParams, GetAllCoursesResult } from './user.services';

export interface ICourseManagementService {
  // Course CRUD operations
  getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult>;
  getCourseById(courseId: string): Promise<ICourse | null>;
  createCourse(courseData: Partial<ICourse>): Promise<ICourse>;
  updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null>;
  deleteCourse(courseId: string): Promise<void>;
  
  // Course status management
  updateCourseStatus(courseId: string, status: string): Promise<void>;
  publishCourse(courseId: string): Promise<void>;
  unpublishCourse(courseId: string): Promise<void>;
  
  // Course analytics
  getCoursePerformanceReport(): Promise<any>;
  getCourseStats(courseId: string): Promise<any>;
  getCourseEnrollmentStats(courseId: string): Promise<any>;
} 