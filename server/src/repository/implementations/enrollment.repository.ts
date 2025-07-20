import { BaseRepository } from './base.repository';
import { IEnrollment } from '../../models/interfaces/enrollment.interface';
import { IEnrollmentRepository } from '../interfaces/enrollment.interface';
import Enrollment from '../../models/implementations/enrollmentModel';

export class EnrollmentRepository extends BaseRepository<IEnrollment> implements IEnrollmentRepository {
  constructor() {
    super(Enrollment);
  }

  async createEnrollment(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment> {
    return this.create(enrollmentData);
  }

  async findEnrollmentsByStudent(studentId: string): Promise<IEnrollment[]> {
    return this.model.find({ student: studentId }).populate('course');
  }

  async findEnrollmentsByCourse(courseId: string): Promise<IEnrollment[]> {
    return this.model.find({ course: courseId }).populate('student');
  }

  async findCompletedEnrollments(studentId: string): Promise<IEnrollment[]> {
    return this.model.find({ student: studentId, status: 'completed' }).populate('course');
  }

  async findPendingEnrollments(studentId: string): Promise<IEnrollment[]> {
    return this.model.find({ student: studentId, status: 'pending' }).populate('course');
  }

  async findEnrollmentByStudentAndCourse(studentId: string, courseId: string): Promise<IEnrollment | null> {
    return this.model.findOne({ student: studentId, course: courseId });
  }

  async getEnrollmentStats(courseId?: string): Promise<any> {
    const matchStage = courseId ? { course: courseId } : {};
    
    const stats = await this.model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    return {
      total: stats.reduce((sum, stat) => sum + stat.count, 0),
      completed: stats.find(s => s._id === 'completed')?.count || 0,
      pending: stats.find(s => s._id === 'pending')?.count || 0,
      failed: stats.find(s => s._id === 'failed')?.count || 0,
      totalRevenue: stats.reduce((sum, stat) => sum + (stat.totalAmount || 0), 0)
    };
  }

  async getStudentEnrollmentProgress(studentId: string, courseId: string): Promise<any> {
    const enrollment = await this.model.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      return null;
    }

    return {
      enrollmentId: enrollment._id,
      status: enrollment.status,
      enrolledAt: enrollment.createdAt,
      amount: enrollment.amount
    };
  }

  async countEnrollments(filter?: any): Promise<number> {
    return this.model.countDocuments(filter || {});
  }

  async findEnrollmentsWithDetails(params: {
    studentId?: string;
    courseId?: string;
    status?: string;
    populate?: string[];
  }): Promise<IEnrollment[]> {
    const { studentId, courseId, status, populate = [] } = params;
    
    let query: any = {};
    if (studentId) query.student = studentId;
    if (courseId) query.course = courseId;
    if (status) query.status = status;

    let queryBuilder = this.model.find(query);
    
    // Apply population
    populate.forEach(field => {
      queryBuilder = queryBuilder.populate(field);
    });

    return queryBuilder.exec();
  }
} 