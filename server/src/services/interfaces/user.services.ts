import { ICourse } from '../../models/interfaces/course.interface';
import { IModule } from '../../models/implementations/moduleModel';
import { ILecture } from '../../models/implementations/lectureModel';

export interface GetAllCoursesParams {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search: string;
  category: string;
  level: string;
  minPrice?: number;
  maxPrice?: number;
}

// For admin: course with enrolledCount
export interface AdminCourse extends ICourse {
  enrolledCount: number;
}

export interface GetAllCoursesResult {
  courses: ICourse[] | AdminCourse[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface IUserService {
  getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult>;
  changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }>;
  getModulesForCourse(courseId: string, userId: string): Promise<{ modules: IModule[], unlocked: boolean[], completed: boolean[] }>;
  getLecturesForModule(moduleId: string, userId: string): Promise<{ lectures: ILecture[], completed: boolean[] }>;
  completeLecture(userId: string, moduleId: string, lectureId: string): Promise<void>;
  getModuleProgress(userId: string, courseId: string): Promise<{ unlocked: boolean[], completed: boolean[] }>;
  isEnrolledInCourse(userId: string, courseId: string): Promise<boolean>;
} 