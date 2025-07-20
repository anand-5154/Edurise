import { IInstructorService } from "../interfaces/instructor.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { ICourseRepository } from "../../repository/interfaces/course.repository";
import { IEnrollmentRepository } from "../../repository/interfaces/enrollment.interface";
import { IMessageRepository } from "../../repository/interfaces/message.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { IUser } from "../../models/interfaces/auth.interface";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ICourse } from "../../models/interfaces/course.interface";
import { IEnrollment } from "../../models/interfaces/enrollment.interface";
import { IMessage } from "../../models/implementations/messageModel";
import { messages } from '../../constants/messages';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEarnings: number;
  totalMessages: number;
  recentCourses: {
    id: string;
    title: string;
    students: number;
    rating: number;
  }[];
  recentMessages: {
    id: string;
    studentName: string;
    message: string;
    timestamp: string;
  }[];
}

export class InstructorService implements IInstructorService {
  constructor(
    private instructorRepository: IInstructorAuthRepository,
    private courseRepository: ICourseRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private messageRepository: IMessageRepository
  ) {}

  async createCourse(instructorId: string, courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      // Check if instructor exists and is verified
      const instructor = await this.instructorRepository.findById(instructorId);
      if (!instructor) {
        throw new Error(messages.INSTRUCTOR_NOT_FOUND);
      }

      if (!instructor.isVerified) {
        throw new Error(messages.ACCOUNT_PENDING_VERIFICATION);
      }

      if (instructor.accountStatus !== "approved") {
        throw new Error(messages.ACCOUNT_NOT_APPROVED);
      }

      // Create the course
      const course = await this.courseRepository.create({
        ...courseData,
        instructor: instructorId,
        isPublished: false
      });

      return course;
    } catch (error) {
      console.error('Error in createCourse:', error);
      throw error;
    }
  }

  async getDashboardStats(instructorId: string): Promise<DashboardStats> {
    try {
      // Get all courses for instructor
      const courses = await this.courseRepository.getCoursesByInstructor(instructorId);
      const courseIds = courses.map(course => course._id);
      // Get total students (unique students with completed enrollments)
      const enrollments = await this.enrollmentRepository.findAll({ course: { $in: courseIds }, status: 'completed' });
      const studentIds = Array.from(new Set(enrollments.map(e => e.student.toString())));
      const totalStudents = studentIds.length;
      // Get total courses
      const totalCourses = courses.length;
      // Get total earnings
      const totalEarnings = enrollments.reduce((sum, enrollment) => sum + (typeof enrollment.amount === 'number' ? enrollment.amount : 0), 0);
      // Get recent courses with student count and average rating
      const recentCourses = courses.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 2);
      const coursesWithStats = await Promise.all(recentCourses.map(async (course) => {
        const studentCount = await this.enrollmentRepository.countEnrollments({ course: course._id });
        const ratings = await this.enrollmentRepository.findAll({ course: course._id, rating: { $exists: true } });
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
          : 0;
        return {
          id: course._id,
          title: course.title,
          students: studentCount,
          rating: averageRating
        };
      }));
      // Get recent messages
      const recentMessages = await this.messageRepository.findByInstructor(instructorId, 2);
      const formattedMessages = recentMessages.map(message => {
        const studentName = message.student && typeof message.student === 'object' && 'name' in message.student
          ? (message.student as any).name
          : 'Unknown Student';
        return {
          id: message._id,
          studentName,
          message: message.content,
          timestamp: message.createdAt
        };
      });
      return {
        totalStudents,
        totalCourses,
        totalEarnings,
        totalMessages: await this.messageRepository.countByInstructor(instructorId),
        recentCourses: coursesWithStats,
        recentMessages: formattedMessages
      };
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      throw error;
    }
  }

  async getCourses(instructorId: string): Promise<ICourse[]> {
    try {
      const courses = await this.courseRepository.getCoursesByInstructor(instructorId);
      return courses;
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  }

  async getCourseById(instructorId: string, courseId: string): Promise<ICourse | null> {
    try {
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        throw new Error(messages.COURSE_NOT_FOUND);
      }
      return course;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }

  async updateCourse(instructorId: string, courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
    try {
      // Check if instructor exists and is verified
      const instructor = await this.instructorRepository.findById(instructorId);
      if (!instructor) {
        throw new Error(messages.INSTRUCTOR_NOT_FOUND);
      }

      if (!instructor.isVerified) {
        throw new Error(messages.ACCOUNT_PENDING_VERIFICATION);
      }

      if (instructor.accountStatus !== "approved") {
        throw new Error(messages.ACCOUNT_NOT_APPROVED);
      }

      // Update the course
      const course = await this.courseRepository.updateById(courseId, courseData);
      if (!course) {
        throw new Error(messages.COURSE_NOT_FOUND);
      }
      return course;
    } catch (error) {
      console.error('Error in updateCourse:', error);
      throw error;
    }
  }

  async getProfile(instructorId: string) {
    return this.instructorRepository.findById(instructorId);
  }

  async updateProfile(instructorId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string; education?: string }) {
    return this.instructorRepository.updateById(instructorId, update);
  }

  async changePassword(instructorId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const instructor = await this.instructorRepository.findById(instructorId);
    if (!instructor) {
      return { success: false, message: messages.INSTRUCTOR_NOT_FOUND };
    }
    if (instructor.password) {
      const isMatch = await bcrypt.compare(currentPassword, instructor.password);
      if (!isMatch) {
        return { success: false, message: messages.PASSWORD_INCORRECT };
      }
    }
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return { success: false, message: messages.PASSWORD_WEAK };
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.instructorRepository.updatePasswordById(instructorId, hashed);
    return { success: true };
  }

  async getCourseLectureProgress(courseId: string) {
    // ... unchanged ...
  }
} 