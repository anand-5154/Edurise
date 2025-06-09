import { IAdminRepository } from '../interfaces/admin.interface';
import { IUser } from '../../models/interfaces/auth.interface';
import { IInstructor } from '../../models/interfaces/instructorAuth.interface';
import User from '../../models/implementations/userModel';
import Instructor from '../../models/implementations/instructorModel';
import bcrypt from 'bcrypt';
import { generateToken } from '../../utils/generateToken';
import Course from '../../models/implementations/courseModel';
import { DashboardStats } from '../../services/interfaces/admin.services';

export class AdminRepository implements IAdminRepository {
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
    const [totalUsers, totalInstructors, totalCourses, pendingRequests] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Instructor.countDocuments({}),
      Course.countDocuments({}),
      Instructor.countDocuments({ accountStatus: 'pending' })
    ]);

    return {
      totalUsers,
      totalInstructors,
      totalCourses,
      pendingRequests
    };
  }

  async login(email: string, password: string): Promise<{ token: string; admin: { id: string; email: string; name: string; }; } | null> {
    const admin = await User.findOne({ email, role: 'admin' }).lean() as IUser & { _id: { toString(): string } };
    if (!admin) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return null;
    }
    const token = generateToken(admin._id.toString(), 'admin');
    return {
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name
      }
    };
  }
}