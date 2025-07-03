import { Request, Response } from 'express';
import { IUserController } from '../../controllers/interfaces/user.controller';
import { IUserService } from '../../services/interfaces/user.services';
import httpStatus from '../../utils/statusCodes';
import { Category } from '../../models/Category';
import User from '../../models/implementations/userModel';
import Enrollment from '../../models/implementations/enrollmentModel';
import LectureProgress from '../../models/implementations/lectureProgressModel';

export class UserController implements IUserController {
  constructor(private userService: IUserService) {}

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', category = '', level = '', minPrice = '', maxPrice = '' } = req.query;
      
      const courses = await this.userService.getAllCourses({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        order: String(order) as 'asc' | 'desc',
        search: String(search),
        category: String(category),
        level: String(level),
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });
      
      res.status(httpStatus.OK).json(courses);
    } catch (err) {
      console.error('Get all courses error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch courses",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const course = await this.userService.getCourseById(courseId);
      
      if (!course) {
        res.status(httpStatus.NOT_FOUND).json({ message: "Course not found" });
        return;
      }

      res.status(httpStatus.OK).json(course);
    } catch (err) {
      console.error('Get course by ID error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch course",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
      const user = await this.userService.getProfile(userPayload.id);
      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        return;
      }
      res.status(httpStatus.OK).json(user);
    } catch (err) {
      console.error('getProfile error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch profile', error: err instanceof Error ? err.message : err });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
      const { name, username, phone, profilePicture } = req.body;
      const updated = await this.userService.updateProfile(userPayload.id, { name, username, phone, profilePicture });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        return;
      }
      res.status(httpStatus.OK).json(updated);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update profile' });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
      // @ts-ignore
      if (!req.file || !req.file.path) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      const updated = await this.userService.updateProfile(userPayload.id, { profilePicture: req.file.path });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
        return;
      }
      res.status(httpStatus.OK).json({ profilePicture: updated.profilePicture });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: 'Failed to upload profile picture', 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'All fields are required' });
        return;
      }
      const result = await this.userService.changePassword(userPayload.id, currentPassword, newPassword);
      if (result.success) {
        res.status(httpStatus.OK).json({ message: 'Password changed successfully' });
      } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: result.message });
      }
    } catch (err) {
      console.error('Change password error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to change password' });
    }
  }

  async isEnrolledInCourse(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: 'Unauthorized' });
        return;
      }
      const { courseId } = req.params;
      if (!courseId) {
        res.status(httpStatus.BAD_REQUEST).json({ message: 'Course ID required' });
        return;
      }
      const enrollment = await Enrollment.findOne({ student: userPayload.id, course: courseId, status: 'completed' });
      res.status(httpStatus.OK).json({ enrolled: !!enrollment });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to check enrollment', error: err });
    }
  }

  // Mark a lecture as completed
  async completeLecture(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { courseId, lectureIndex } = req.params;
      await LectureProgress.findOneAndUpdate(
        { student: userId, course: courseId, lectureIndex: Number(lectureIndex) },
        { $set: { completedAt: new Date() } },
        { upsert: true, new: true }
      );
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Get completed lectures for a course for the logged-in user
  async getLectureProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { courseId } = req.params;
      const progress = await LectureProgress.find({ student: userId, course: courseId });
      const completedLectures = progress.map(p => p.lectureIndex);
      res.status(200).json({ completedLectures });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
} 