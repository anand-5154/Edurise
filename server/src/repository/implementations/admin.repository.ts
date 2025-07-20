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

export class AdminRepository extends BaseRepository<IUser> implements IAdminRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email, role: 'admin' });
  }

  async getAllUsers(): Promise<IUser[]> {
    const users = await User.find({ role: 'user' }).lean();
    return users;
  }

  async getAllInstructors(): Promise<IInstructor[]> {
    const instructors = await Instructor.find({}).lean();
    return instructors;
  }

  async blockUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { blocked: true });
  }

  async unblockUser(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { blocked: false });
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

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; admin: { id: string; email: string; name: string; }; } | null> {
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

  async updatePasswordById(id: string, hashedPassword: string) {
    return User.findOneAndUpdate({ _id: id, role: 'admin' }, { password: hashedPassword }, { new: true });
  }

  async refreshToken(token: string): Promise<{ accessToken: string }> {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
    const admin = await User.findOne({ _id: decoded.id, role: 'admin' });
    if (!admin || admin.refreshToken !== token) {
      throw new Error('Invalid refresh token');
    }
    const accessToken = generateAccessToken(admin._id.toString(), 'admin');
    return { accessToken };
  }

  async getUserDetailsWithProgress(userId: string): Promise<any> {
    try {
    const user = await User.findById(userId).select('-password -refreshToken -__v');
    if (!user) return null;
      let enrollments = [];
      let progress = [];
      try {
        enrollments = await Enrollment.find({ student: userId, status: 'completed' }).populate('course');
      } catch (enrErr) {
        console.error('Error fetching enrollments:', enrErr);
        // Return partial data if possible
        return { user, courses: [], error: 'Failed to fetch enrollments' };
      }
      try {
        progress = await LectureProgress.find({ student: userId });
      } catch (progErr) {
        console.error('Error fetching lecture progress:', progErr);
        // Return partial data if possible
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