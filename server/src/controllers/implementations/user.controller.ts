import { Request, Response } from 'express';
import { IUserController } from '../../controllers/interfaces/user.controller';
import { IUserService } from '../../services/interfaces/user.services';
import { httpStatus } from '../../constants/statusCodes';
import { messages } from '../../constants/messages';
import { IModule } from '../../models/implementations/moduleModel';
import { ILecture } from '../../models/implementations/lectureModel';

export class UserController implements IUserController {
  constructor(private _userService: IUserService) {}

  async getAllCourses(req: Request, res: Response): Promise<void> {
    console.log('UserController: getAllCourses called', req.query);
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', category = '', level = '', minPrice = '', maxPrice = '' } = req.query;
      const courses = await this._userService.getAllCourses({
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
      console.log('UserController: getAllCourses returning', Array.isArray(courses) ? courses.length : courses);
      res.status(httpStatus.OK).json(courses);
    } catch (err) {
      console.error('Get all courses error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_FETCH,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const course = await this._userService.getCourseById(courseId);
      if (!course) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.COURSE_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(course);
    } catch (err) {
      console.error('Get course by ID error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_FETCH_COURSE,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await this._userService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_CATEGORIES, error: error.message });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const user = await this._userService.getProfile(userPayload.id);
      if (!user) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(user);
    } catch (err) {
      console.error('getProfile error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_USER, error: err instanceof Error ? err.message : err });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const { name, username, phone, profilePicture } = req.body;
      const updated = await this._userService.updateProfile(userPayload.id, { name, username, phone, profilePicture });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(updated);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_USER });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      // @ts-ignore
      if (!req.file || !req.file.path) {
        res.status(httpStatus.BAD_REQUEST).json({ message: messages.NO_FILE_UPLOADED });
        return;
      }
      const updated = await this._userService.updateProfile(userPayload.id, { profilePicture: req.file.path });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json({ profilePicture: updated.profilePicture });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_UPLOAD_PROFILE, 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(httpStatus.BAD_REQUEST).json({ message: messages.ALL_FIELDS_REQUIRED });
        return;
      }
      const result = await this._userService.changePassword(userPayload.id, currentPassword, newPassword);
      if (result.success) {
        res.status(httpStatus.OK).json({ message: messages.PASSWORD_CHANGED });
      } else {
        res.status(httpStatus.BAD_REQUEST).json({ message: result.message });
      }
    } catch (err) {
      console.error('Change password error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_CHANGE_PASSWORD });
    }
  }

  async isEnrolledInCourse(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userPayload = req.user;
      if (!userPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const { courseId } = req.params;
      if (!courseId) {
        res.status(httpStatus.BAD_REQUEST).json({ message: messages.ALL_FIELDS_REQUIRED });
        return;
      }
      const enrolled = await this._userService.isEnrolledInCourse(userPayload.id, courseId);
      res.status(httpStatus.OK).json({ enrolled });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH, error: err });
    }
  }

  async getLectureProgress(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user.id;
      const { courseId } = req.params;
      const completedLectures = await this._userService.getLectureProgress(userId, courseId);
      res.status(httpStatus.OK).json({ completedLectures });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message });
    }
  }

  async getModulesForCourse(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      // @ts-ignore
      const userId = req.user.id;
      const result = await this._userService.getModulesForCourse(courseId, userId);
      res.status(httpStatus.OK).json(result);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch modules' });
    }
  }

  async getLecturesForModule(req: Request, res: Response): Promise<void> {
    console.log('[UserController] getLecturesForModule called with moduleId:', req.params.moduleId);
    try {
      const { moduleId } = req.params;
      // @ts-ignore
      const userId = req.user.id;
      const result = await this._userService.getLecturesForModule(moduleId, userId);
      res.status(httpStatus.OK).json(result);
    } catch (err) {
      console.error('[UserController] getLecturesForModule error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch lectures', error: err instanceof Error ? err.message : err });
    }
  }

  async completeLecture(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const { moduleId, lectureId } = req.params;
      console.log('[UserController] completeLecture called with:', { userId, moduleId, lectureId });
      await this._userService.completeLecture(userId, moduleId, lectureId);
      res.status(httpStatus.OK).json({ message: 'Lecture marked as completed' });
    } catch (err) {
      console.error('[UserController] completeLecture error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update progress', error: err instanceof Error ? err.message : err });
    }
  }

  async getPurchasedCourses(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const userId = req.user.id;
      const courses = await this._userService.getPurchasedCourses(userId);
      res.status(200).json(courses);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch purchased courses', error: err instanceof Error ? err.message : err });
    }
  }
} 