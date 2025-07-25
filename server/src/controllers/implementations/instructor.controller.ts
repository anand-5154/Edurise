import { IInstructorController } from "../interfaces/instructor.interface";
import { IInstructorService } from "../../services/interfaces/instructor.services";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";
import { messages } from "../../constants/messages";
import { IModule } from '../../models/implementations/moduleModel';
import { ILecture } from '../../models/implementations/lectureModel';
import { IInstructorBankInfo } from '../../models/interfaces/instructorBankInfo.interface';

interface JwtPayload {
  id: string;
  role: string;
}

export class InstructorController implements IInstructorController {
  constructor(private _instructorService: IInstructorService) {}

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const course = await this._instructorService.createCourse(instructorId, req.body);
      res.status(httpStatus.CREATED).json(course);
    } catch (err) {
      console.error('Create course error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_CREATE_COURSE,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const stats = await this._instructorService.getDashboardStats(instructorId);
      res.status(httpStatus.OK).json(stats);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_FETCH_INSTRUCTOR,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const courses = await this._instructorService.getCourses(instructorId);
      res.status(httpStatus.OK).json(courses);
    } catch (err) {
      console.error('Get courses error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_FETCH_COURSE,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
      const { courseId } = req.params;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const course = await this._instructorService.getCourseById(instructorId, courseId);
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

  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
      const { courseId } = req.params;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const course = await this._instructorService.updateCourse(instructorId, courseId, req.body);
      if (!course) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.COURSE_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(course);
    } catch (err) {
      console.error('Update course error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_UPDATE_COURSE,
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const instructor = await this._instructorService.getProfile(instructorPayload.id);
      if (!instructor) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.INSTRUCTOR_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(instructor);
    } catch (err) {
      console.error('getProfile error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_INSTRUCTOR, error: err instanceof Error ? err.message : err });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const { name, username, phone, profilePicture, education, yearsOfExperience } = req.body;
      const updated = await this._instructorService.updateProfile(instructorPayload.id, { name, username, phone, profilePicture, education, yearsOfExperience });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.INSTRUCTOR_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json(updated);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_INSTRUCTOR });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      // @ts-ignore
      if (!req.file || !req.file.path) {
        res.status(httpStatus.BAD_REQUEST).json({ message: messages.NO_FILE_UPLOADED });
        return;
      }
      const updated = await this._instructorService.updateProfile(instructorPayload.id, { profilePicture: req.file.path });
      if (!updated) {
        res.status(httpStatus.NOT_FOUND).json({ message: messages.INSTRUCTOR_NOT_FOUND });
        return;
      }
      res.status(httpStatus.OK).json({ profilePicture: updated.profilePicture });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: messages.FAILED_TO_UPDATE_INSTRUCTOR, 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(httpStatus.BAD_REQUEST).json({ message: messages.ALL_FIELDS_REQUIRED });
        return;
      }
      const result = await this._instructorService.changePassword(instructorPayload.id, currentPassword, newPassword);
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

  async getCourseLectureProgress(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const progress = await this._instructorService.getCourseLectureProgress(courseId);
      res.status(httpStatus.OK).json(progress);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ success: false, error: err.message });
    }
  }

  async createModule(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const module = await this._instructorService.createModule(courseId, req.body);
      res.status(httpStatus.CREATED).json(module);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create module' });
    }
  }

  async updateModule(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const module = await this._instructorService.updateModule(moduleId, req.body);
      res.status(httpStatus.OK).json(module);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update module' });
    }
  }

  async deleteModule(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      await this._instructorService.deleteModule(moduleId);
      res.status(httpStatus.OK).json({ message: 'Module deleted successfully' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete module' });
    }
  }

  async getModules(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const modules = await this._instructorService.getModules(courseId);
      res.status(httpStatus.OK).json(modules);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch modules' });
    }
  }

  async reorderModules(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { moduleOrder } = req.body;
      await this._instructorService.reorderModules(courseId, moduleOrder);
      res.status(httpStatus.OK).json({ message: 'Modules reordered successfully' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to reorder modules' });
    }
  }

  async createLecture(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const lecture = await this._instructorService.createLecture(moduleId, req.body);
      res.status(httpStatus.CREATED).json(lecture);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to create lecture' });
    }
  }

  async updateLecture(req: Request, res: Response): Promise<void> {
    try {
      const { lectureId } = req.params;
      const lecture = await this._instructorService.updateLecture(lectureId, req.body);
      res.status(httpStatus.OK).json(lecture);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update lecture' });
    }
  }

  async deleteLecture(req: Request, res: Response): Promise<void> {
    try {
      const { lectureId } = req.params;
      await this._instructorService.deleteLecture(lectureId);
      res.status(httpStatus.OK).json({ message: 'Lecture deleted successfully' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to delete lecture' });
    }
  }

  async getLectures(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const lectures = await this._instructorService.getLectures(moduleId);
      res.status(httpStatus.OK).json(lectures);
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch lectures' });
    }
  }

  async reorderLectures(req: Request, res: Response): Promise<void> {
    try {
      const { moduleId } = req.params;
      const { lectureOrder } = req.body;
      await this._instructorService.reorderLectures(moduleId, lectureOrder);
      res.status(httpStatus.OK).json({ message: 'Lectures reordered successfully' });
    } catch (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to reorder lectures' });
    }
  }

  async getBankInfo(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorId = req.user.id;
      const bankInfo = await this._instructorService.getBankInfo(instructorId);
      res.status(200).json(bankInfo);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to fetch bank info', error: err.message });
    }
  }

  async upsertBankInfo(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorId = req.user.id;
      const bankInfo = await this._instructorService.upsertBankInfo(instructorId, req.body);
      res.status(200).json(bankInfo);
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to update bank info', error: err.message });
    }
  }

  async deleteBankInfo(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorId = req.user.id;
      await this._instructorService.deleteBankInfo(instructorId);
      res.status(200).json({ message: 'Bank info deleted' });
    } catch (err: any) {
      res.status(500).json({ message: 'Failed to delete bank info', error: err.message });
    }
  }
} 