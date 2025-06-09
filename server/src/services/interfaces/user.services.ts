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

export interface GetAllCoursesResult {
  courses: ICourse[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface IUserService {
  getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult>;
} 