import { IAdminRepository } from '../interfaces/admin.interface';
import { IUser } from '../../models/interfaces/auth.interface';
import { IInstructor } from '../../models/interfaces/instructorAuth.interface';
import User from '../../models/implementations/userModel';
import Instructor from '../../models/implementations/instructorModel';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../../utils/generateToken';
import Course from '../../models/implementations/courseModel';
import { DashboardStats } from '../../services/interfaces/admin.services';
import Enrollment from '../../models/implementations/enrollmentModel';
import jwt from 'jsonwebtoken';
import LectureProgress from '../../models/implementations/lectureProgressModel';
import { BaseRepository } from './base.repository';
import { UserRepository } from './user.repository';
import { EnrollmentRepository } from './enrollment.repository';
import { LectureProgressRepository } from './lectureProgress.repository';

export class AdminRepository extends BaseRepository<IUser> implements IAdminRepository {
  constructor(
    private userRepository: UserRepository,
    private enrollmentRepository: EnrollmentRepository,
    private lectureProgressRepository: LectureProgressRepository
  ) {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async getAllUsers(): Promise<IUser[]> {
    return await this.userRepository.findUsersByRole('user');
  }

  async getAllInstructors(): Promise<IInstructor[]> {
    // Assuming you have an InstructorRepository, otherwise keep as is
    return await Instructor.find({}).lean();
  }

  async blockUser(userId: string): Promise<void> {
    await this.userRepository.updateUserStatus(userId, true);
  }

  async unblockUser(userId: string): Promise<void> {
    await this.userRepository.updateUserStatus(userId, false);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalUsers, totalInstructors, totalCourses, pendingRequests, revenueRaw] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Instructor.countDocuments({}),
      Course.countDocuments({}),
      Instructor.countDocuments({ accountStatus: 'pending' }),
      Enrollment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    // revenueRaw is an array from aggregate, extract total
    const revenue = Array.isArray(revenueRaw) && revenueRaw.length > 0 ? revenueRaw[0].total : 0;
    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      pendingRequests,
      revenue
    };
  }

  async login(email: string, password: string): Promise<{
      _id: any; accessToken: string; refreshToken: string; admin: { id: string; email: string; name: string; }; 
} | null> {
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return null;
    }
    const accessToken = generateAccessToken(admin._id.toString(), 'admin');
    const refreshToken = generateRefreshToken(admin._id.toString());
    
    admin.refreshToken = refreshToken;
    await admin.save();
    
    return {
      _id: admin._id,
      accessToken,
      refreshToken,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name
      }
    };
  }

  async findById(id: string) {
    return User.findOne({ _id: id, role: 'admin' }).select('-password -__v');
  }

  async updateById(id: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
    return User.findOneAndUpdate({ _id: id, role: 'admin' }, update, { new: true }).select('-password -__v');
  }

  async updateRefreshTokenById(id: string, refreshToken: string) {
    return User.findOneAndUpdate({ _id: id, role: 'admin' }, { refreshToken }, { new: true }).select('-password -__v');
  }

  async updatePasswordById(id: string, hashedPassword: string) {
    return User.findOneAndUpdate({ _id: id, role: 'admin' }, { password: hashedPassword }, { new: true });
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
      const admin = await User.findOne({ _id: decoded.id, role: 'admin' });
      // Debug logging
      console.log('Decoded admin ID:', decoded.id);
      console.log('Admin refreshToken in DB:', admin?.refreshToken);
      console.log('Provided refreshToken:', token);
      if (!admin || admin.refreshToken !== token) {
        throw new Error('Invalid refresh token');
      }
      const accessToken = generateAccessToken(admin._id.toString(), 'admin');
      return { accessToken };
    } catch (error: any) {
      console.error('Admin refreshToken error:', error);
      throw new Error('Invalid refresh token');
    }
  }

  async getUserDetailsWithProgress(userId: string): Promise<any> {
    try {
      const user = await this.userRepository.findById(userId);
    if (!user) return null;
      let enrollments = [];
      let progress = [];
      try {
        enrollments = await this.enrollmentRepository.findEnrollmentsByStudent(userId);
      } catch (enrErr) {
        console.error('Error fetching enrollments:', enrErr);
        return { user, courses: [], error: 'Failed to fetch enrollments' };
      }
      try {
        progress = await this.lectureProgressRepository.findByUserAndCourse(userId, null);
      } catch (progErr) {
        console.error('Error fetching lecture progress:', progErr);
        return { user, courses: [], error: 'Failed to fetch lecture progress' };
      }
    // Map courseId to completed lecture indices
    const progressMap: Record<string, number[]> = {};
    progress.forEach(p => {
        const cid = p.course?.toString?.() || String(p.course);
      if (!progressMap[cid]) progressMap[cid] = [];
      progressMap[cid].push(p.lectureIndex);
    });
    const courses = enrollments.map(enr => {
      const course = enr.course;
        // Defensive: check course is an object and has _id/title
        if (!course || typeof course !== 'object' || !('title' in course) || !('_id' in course)) {
          return null;
        }
      return {
        id: course._id,
          title: (course as any).title,
        lecturesCompleted: progressMap[course._id.toString()] || []
      };
      }).filter(Boolean);
    return {
      user,
      courses
    };
    } catch (err) {
      console.error('getUserDetailsWithProgress error:', err);
      // Return a user-friendly error object
      return { error: 'Failed to fetch user details. Please contact support.' };
    }
  }
}