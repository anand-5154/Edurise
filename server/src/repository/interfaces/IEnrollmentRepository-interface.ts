import { IEnrollment } from '../../models/interfaces/IEnrollment-interface';

export interface IEnrollmentRepository {
  // Basic CRUD operations
  createEnrollment(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment>;
  findById(id: string): Promise<IEnrollment | null>;
  findAll(filter?: any): Promise<IEnrollment[]>;
  updateById(id: string, update: Partial<IEnrollment>): Promise<IEnrollment | null>;
  deleteById(id: string): Promise<void>;
  
  // Enrollment-specific operations
  findEnrollmentsByStudent(studentId: string): Promise<IEnrollment[]>;
  findEnrollmentsByCourse(courseId: string): Promise<IEnrollment[]>;
  findCompletedEnrollments(studentId: string): Promise<IEnrollment[]>;
  findPendingEnrollments(studentId: string): Promise<IEnrollment[]>;
  findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<IEnrollment | null>;
  
  // Enrollment analytics
  getEnrollmentStats(courseId?: string): Promise<any>;
  getStudentEnrollmentProgress(studentId: string, courseId: string): Promise<any>;
  countEnrollments(filter?: any): Promise<number>;
  
  // Bulk operations
  findEnrollmentsWithDetails(params: {
    studentId?: string;
    courseId?: string;
    status?: string;
    populate?: string[];
  }): Promise<IEnrollment[]>;
} 