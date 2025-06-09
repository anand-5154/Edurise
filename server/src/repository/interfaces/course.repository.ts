import { ICourse } from "../../models/interfaces/course.interface";

export interface GetCoursesParams {
  query: any;
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
}

export interface ICourseRepository {
  createCourse(courseData: Partial<ICourse>): Promise<ICourse>;
  getCourseById(courseId: string): Promise<ICourse | null>;
  getCoursesByInstructor(instructorId: string): Promise<ICourse[]>;
  updateCourse(courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(): Promise<ICourse[]>;
  getCourses(params: GetCoursesParams): Promise<ICourse[]>;
  countCourses(query: any): Promise<number>;
  updateCourseStatus(courseId: string, isPublished: boolean): Promise<ICourse | null>;
} 