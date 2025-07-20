import { IUserService, GetAllCoursesParams, GetAllCoursesResult } from '../interfaces/user.services';
import { ICourseRepository } from '../../repository/interfaces/course.repository';
import { IUserRepository } from '../../repository/interfaces/user.interface';
import { ICourse } from '../../models/interfaces/course.interface';
import bcrypt from 'bcrypt';
import { messages } from '../../constants/messages';

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private courseRepository: ICourseRepository
  ) {}

  async getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult> {
    return this.courseRepository.getCoursesWithPagination(params);
  }

  async getCourseById(courseId: string): Promise<ICourse | null> {
    return this.courseRepository.findByIdIfPublished(courseId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { success: false, message: messages.USER_NOT_FOUND };
    }
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { success: false, message: messages.PASSWORD_INCORRECT };
      }
    }
    // Allow Google users (no password) to set a password
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateById(userId, { password: hashed });
    return { success: true };
  }

  async getProfile(userId: string) {
    return this.userRepository.findById(userId);
  }

  async updateProfile(userId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
    return this.userRepository.updateById(userId, update);
  }
} 