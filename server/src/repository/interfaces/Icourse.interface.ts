import { ICourse } from "../../models/interfaces/Icourse.interface";

export interface ICourseRepository {
  createCourse(courseData: Partial<ICourse>): Promise<ICourse>;
  findAllCourse(
    page: number,
    limit: number,
    search: string
  ): Promise<{ course: ICourse[]; total: number; totalPage: number }>;
  findCourses(
    page: number,
    limit: number,
    search: string,
    category: string,
    minPrice: number,
    maxPrice: number
  ): Promise<{ courses: ICourse[]; total: number; totalPages: number }>;
  findCourseById(courseId: string): Promise<ICourse | null>;
  findPurchasedCoursesByUser(userId: string): Promise<ICourse[]>;
  findCoursesByInstructor(
    instructorId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ courses: ICourse[]; total: number; totalPages: number }>;
  updateCourseStatus(
    courseId: string,
    isActive: boolean
  ): Promise<ICourse | null>;
  updateCourseById(
    courseId: string,
    courseData: Partial<ICourse>
  ): Promise<ICourse | null>;
  addEnrolledUser(courseId: string, userId: string): Promise<ICourse | null>;
  removeEnrolledUser(courseId: string, userId: string): Promise<ICourse | null>;
  getCourseStats(): Promise<{ title: string; enrolledCount: number }[]>;
  findByPurchasedUser(userId: string): Promise<string[]>;
  getUsersByInstructor(instructorId: string): Promise<string[]>;
  getCourseStatsOfInstructor(
    instructorId: string
  ): Promise<{ title: string; enrolledCount: number }[]>;
  findCourseByIdAndInstructor(courseId: string, instructorId: string):Promise<ICourse|null>
}
