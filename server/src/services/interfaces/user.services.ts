import { ICourse } from '../../models/interfaces/course.interface';

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
} 