import User from '../../models/implementations/userModel';
import { BaseRepository } from './base.repository';
import { IUser } from '../../models/interfaces/IAuth-interface';
import { IUserRepository } from '../interfaces/IUserRepository-interface';
import Enrollment from '../../models/implementations/enrollmentModel';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email });
  }

  async findUsersByRole(role: string): Promise<IUser[]> {
    return this.model.find({ role }).select('-password');
  }

  async findBlockedUsers(): Promise<IUser[]> {
    return this.model.find({ blocked: true }).select('-password');
  }

  async findActiveUsers(): Promise<IUser[]> {
    return this.model.find({ blocked: false }).select('-password');
  }

  async updateUserStatus(id: string, blocked: boolean): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(id, { blocked }, { new: true }).select('-password');
  }

  async findUsersWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: IUser[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page, limit, search, role } = params;
    
    // Build query
    const query: any = { role: { $ne: 'admin' } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    // Get total count
    const total = await this.model.countDocuments(query);
    
    // Get users with pagination
    const users = await this.model.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async findUsersByIds(userIds: string[]): Promise<IUser[]> {
    return this.model.find({ _id: { $in: userIds } }).select('_id name email');
  }

  async getUserActivityReport(): Promise<any[]> {
    // Group by course, show users per course
    return Enrollment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course._id',
          courseTitle: { $first: '$course.title' },
          users: {
            $push: {
              userId: '$user._id',
              name: '$user.name',
              email: '$user.email',
              status: '$status',
              enrolledAt: '$createdAt'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id',
          courseTitle: 1,
          users: 1
        }
      }
    ]);
  }

  async getUserEnrollmentStats(userId: string): Promise<any> {
    const enrollments = await Enrollment.find({ student: userId });
    const completedEnrollments = enrollments.filter(e => e.status === 'completed');
    
    return {
      totalEnrollments: enrollments.length,
      completedEnrollments: completedEnrollments.length,
      pendingEnrollments: enrollments.filter(e => e.status === 'pending').length,
      totalSpent: completedEnrollments.reduce((sum, e) => sum + (e.amount || 0), 0)
    };
  }

  async getUserActivityReportByCourse(): Promise<any[]> {
    return Enrollment.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $group: {
          _id: '$course._id',
          courseTitle: { $first: '$course.title' },
          users: {
            $push: {
              userId: '$user._id',
              name: '$user.name',
              email: '$user.email',
              status: '$status',
              enrolledAt: '$createdAt'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          courseId: '$_id',
          courseTitle: 1,
          users: 1
        }
      }
    ]);
  }

  async getTopUsersByEnrollments(limit = 3): Promise<any[]> {
    // Top users by total enrollments
    return this.model.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'student',
          as: 'enrollments',
        },
      },
      {
        $addFields: {
          totalEnrollments: { $size: '$enrollments' },
        },
      },
      { $sort: { totalEnrollments: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          totalEnrollments: 1,
        },
      },
    ]);
  }

  async getTopUsersByCompletions(limit = 3): Promise<any[]> {
    // Top users by completed enrollments
    return this.model.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { $expr: { $and: [ { $eq: ['$student', '$$userId'] }, { $eq: ['$status', 'completed'] } ] } } },
          ],
          as: 'completedEnrollments',
        },
      },
      {
        $addFields: {
          completedEnrollmentsCount: { $size: '$completedEnrollments' },
        },
      },
      { $sort: { completedEnrollmentsCount: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          completedEnrollmentsCount: 1,
        },
      },
    ]);
  }

  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new this.model(userData);
    await user.save();
    return user;
  }
} 