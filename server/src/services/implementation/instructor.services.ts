import { IInstructorService } from "../interfaces/instructor.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/instructorAuth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { IUser } from "../../models/interfaces/auth.interface";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ICourse } from "../../models/interfaces/course.interface";
import { IEnrollment } from "../../models/interfaces/enrollment.interface";
import { IMessage } from "../../models/interfaces/message.interface";
import Course from "../../models/implementations/courseModel";
import Enrollment from "../../models/implementations/enrollmentModel";
import Message from "../../models/implementations/messageModel";
import Instructor from "../../models/implementations/instructorModel";
import User from "../../models/implementations/userModel";

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
  constructor(private instructorRepository: IInstructorAuthRepository) {}

  async createCourse(instructorId: string, courseData: Partial<ICourse>): Promise<ICourse> {
    try {
      // Check if instructor exists and is verified
      const instructor = await Instructor.findById(instructorId);
      if (!instructor) {
        throw new Error("Instructor not found");
      }

      if (!instructor.isVerified) {
        throw new Error("Your account is pending verification");
      }

      if (instructor.accountStatus !== "approved") {
        throw new Error("Your account is not approved");
      }

      // Create the course
      const course = await Course.create({
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
      // Get total students (unique students with completed enrollments in instructor's courses)
      const courses = await Course.find({ instructor: instructorId });
      const courseIds = courses.map(course => course._id);
      const totalStudents = await Enrollment.distinct('student', {
        course: { $in: courseIds },
        status: 'completed'
      }).length;

      // Get total courses
      const totalCourses = courses.length;

      // Get total earnings
      const enrollments = await Enrollment.find({
        course: { $in: courseIds },
        status: 'completed'
      });
      
      const totalEarnings = enrollments.reduce((sum, enrollment) => {
        const amount = typeof enrollment.amount === 'number' ? enrollment.amount : 0;
        return sum + amount;
      }, 0);

      // Get recent courses with student count and average rating
      const recentCourses = await Course.find({ instructor: instructorId })
        .sort({ createdAt: -1 })
        .limit(2)
        .lean();

      const coursesWithStats = await Promise.all(recentCourses.map(async (course) => {
        const studentCount = await Enrollment.countDocuments({ course: course._id });
        const ratings = await Enrollment.find({ course: course._id, rating: { $exists: true } })
          .select('rating');
        const averageRating = ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
          : 0;

        return {
          id: course._id,
          title: course.title,
          students: studentCount,
          rating: averageRating
        };
      }));

      // Get recent messages
      const recentMessages = await Message.find({ instructor: instructorId })
        .sort({ createdAt: -1 })
        .limit(2)
        .populate({
          path: 'student',
          select: 'name',
          model: 'User',
          options: { lean: true }
        })
        .lean();

      const formattedMessages = recentMessages.map(message => {
        const studentName = message.student && typeof message.student === 'object' && 'name' in message.student
          ? message.student.name
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
        totalMessages: await Message.countDocuments({ instructor: instructorId }),
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
      const courses = await Course.find({ instructor: instructorId })
        .sort({ createdAt: -1 })
        .lean();

      return courses;
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  }

  async getCourseById(instructorId: string, courseId: string): Promise<ICourse | null> {
    try {
      const course = await Course.findOne({
        _id: courseId,
        instructor: instructorId
      })
      .populate('instructor', 'name email')
      .select('+demoVideo');

      return course;
    } catch (error) {
      console.error('Error in getCourseById:', error);
      throw error;
    }
  }

  async updateCourse(instructorId: string, courseId: string, courseData: Partial<ICourse>): Promise<ICourse | null> {
    try {
      // Check if instructor exists and is verified
      const instructor = await Instructor.findById(instructorId);
      if (!instructor) {
        throw new Error("Instructor not found");
      }

      if (!instructor.isVerified) {
        throw new Error("Your account is pending verification");
      }

      if (instructor.accountStatus !== "approved") {
        throw new Error("Your account is not approved");
      }

      // Update the course
      const course = await Course.findOneAndUpdate(
        {
          _id: courseId,
          instructor: instructorId
        },
        { $set: courseData },
        { new: true }
      ).populate('instructor', 'name email');

      return course;
    } catch (error) {
      console.error('Error in updateCourse:', error);
      throw error;
    }
  }

  async getProfile(instructorId: string) {
    return this.instructorRepository.findById(instructorId);
  }

  async updateProfile(instructorId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
    return this.instructorRepository.updateById(instructorId, update);
  }

  async changePassword(instructorId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const instructor = await this.instructorRepository.findById(instructorId);
    if (!instructor) {
      return { success: false, message: 'Instructor not found' };
    }
    if (instructor.password) {
      const isMatch = await bcrypt.compare(currentPassword, instructor.password);
      if (!isMatch) {
        return { success: false, message: 'Current password is incorrect' };
      }
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.instructorRepository.updatePasswordById(instructorId, hashed);
    return { success: true };
  }
} 