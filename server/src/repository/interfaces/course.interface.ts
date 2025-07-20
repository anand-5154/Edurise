import { ICourse } from '../../models/interfaces/course.interface';

export interface ICourseRepository {
  // Basic CRUD operations
  createCourse(courseData: Partial<ICourse>): Promise<ICourse>;
  findById(id: string): Promise<ICourse | null>;
  findAll(filter?: any): Promise<ICourse[]>;
  updateById(id: string, update: Partial<ICourse>): Promise<ICourse | null>;
  deleteById(id: string): Promise<void>;
  
  // Course-specific operations
  findCoursesByInstructor(instructorId: string): Promise<ICourse[]>;
  findPublishedCourses(): Promise<ICourse[]>;
  findCoursesByCategory(categoryId: string): Promise<ICourse[]>;
  findCoursesByLevel(level: string): Promise<ICourse[]>;
  updateCourseStatus(id: string, status: string): Promise<ICourse | null>;
  
  // Search and pagination
  findCoursesWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
    category?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<{
    courses: ICourse[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;
  
  // Course analytics
  getCoursePerformanceReport(): Promise<any>;
  getCourseEnrollmentStats(courseId: string): Promise<any>;
  countCourses(filter?: any): Promise<number>;
} 