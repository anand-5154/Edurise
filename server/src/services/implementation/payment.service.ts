import { IPaymentService } from '../interfaces/payment.interface';
import { createOrder, verifyPayment } from './razorpay.service';
import { IEnrollmentRepository } from '../../repository/interfaces/enrollment.interface';
import { httpStatus } from '../../constants/statusCodes';

export class PaymentService implements IPaymentService {
  constructor(
    private _enrollmentRepository: IEnrollmentRepository
  ) {}

  async createOrder(amount: number, courseId: string): Promise<{
    orderId: string;
    amount: number;
    currency: string;
  }> {
    try {
      // Ensure receipt is always <= 40 chars
      const shortCourseId = String(courseId).slice(0, 20);
      const receipt = `rcpt_${shortCourseId}_${Date.now()}`.slice(0, 40);
      const order = await createOrder(amount, receipt);
      
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      console.error('Payment order creation error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string): Promise<boolean> {
    try {
      return verifyPayment(orderId, paymentId, signature);
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  async createEnrollment(userId: string, courseId: string, amount: number): Promise<any> {
    try {
      // Check if enrollment already exists
      const existingEnrollment = await this._enrollmentRepository.findEnrollmentByStudentAndCourse(userId, courseId);
      if (existingEnrollment) {
        throw new Error('User already enrolled in this course');
      }

      // Create new enrollment
      const enrollment = await this._enrollmentRepository.createEnrollment({
        student: userId,
        course: courseId,
        amount: amount,
        status: 'completed'
      });

      return enrollment;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('User already enrolled in this course');
      }
      console.error('Enrollment creation error:', error);
      throw new Error('Failed to create enrollment');
    }
  }

  async checkExistingEnrollment(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this._enrollmentRepository.findEnrollmentByStudentAndCourse(userId, courseId);
      return !!enrollment;
    } catch (error) {
      console.error('Enrollment check error:', error);
      return false;
    }
  }

  async getPaymentStats(): Promise<any> {
    try {
      const stats = await this._enrollmentRepository.getEnrollmentStats();
      return {
        totalRevenue: stats.totalRevenue,
        totalEnrollments: stats.total,
        completedEnrollments: stats.completed,
        pendingEnrollments: stats.pending,
        failedEnrollments: stats.failed
      };
    } catch (error) {
      console.error('Payment stats error:', error);
      throw new Error('Failed to get payment statistics');
    }
  }

  async getPaymentHistory(userId?: string): Promise<any[]> {
    try {
      const filter = userId ? { student: userId } : {};
      const enrollments = await this._enrollmentRepository.findEnrollmentsWithDetails({
        ...filter,
        populate: ['student', 'course']
      });

      return enrollments.map(enrollment => ({
        id: enrollment._id,
        student: enrollment.student,
        course: enrollment.course,
        amount: enrollment.amount,
        status: enrollment.status,
        createdAt: enrollment.createdAt
      }));
    } catch (error) {
      console.error('Payment history error:', error);
      throw new Error('Failed to get payment history');
    }
  }
} 