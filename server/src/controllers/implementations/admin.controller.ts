import { IAdminController } from "../interfaces/IAdminController-interface";
import { IAdminService } from "../../services/interfaces/IAdminService-interface";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";
import { GetAllCoursesParams } from "../../services/interfaces/IUserService-interface";
import { AdminService } from '../../services/implementation/admin.sevices';
import { messages } from '../../constants/messages';
import { IModule } from '../../models/implementations/moduleModel';

export class AdminController implements IAdminController {
    constructor(private _adminService: IAdminService) {}

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        try {
            const result = await this._adminService.login(email, password);
            if (!result) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: messages.INVALID_CREDENTIALS });
                return;
            }
            res.status(httpStatus.OK).json(result);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.INTERNAL_SERVER_ERROR });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const role = req.query.role as string || '';
            const result = await this._adminService.getAllUsers({ page, limit, search, role });
            res.status(httpStatus.OK).json(result);
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.INTERNAL_SERVER_ERROR });
        }
    }

    async getAllInstructors(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const instructors = await this._adminService.getAllInstructors({
                page: Number(page),
                limit: Number(limit),
                search: String(search)
            });
            res.status(httpStatus.OK).json(instructors);
        } catch (error: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_INSTRUCTOR, error: error.message });
        }
    }

    async verifyInstructor(req: Request, res: Response): Promise<void> {
        const { instructorId } = req.params;
        try {
            await this._adminService.verifyInstructor(instructorId);
            res.status(httpStatus.OK).json({ message: messages.INSTRUCTOR_APPROVED });
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async rejectInstructor(req: Request, res: Response): Promise<void> {
        const { instructorId } = req.params;
        try {
            await this._adminService.rejectInstructor(instructorId);
            res.status(httpStatus.OK).json({ message: messages.INSTRUCTOR_REJECTED });
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this._adminService.getDashboardStats();
            res.status(httpStatus.OK).json(stats);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.INTERNAL_SERVER_ERROR });
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            await this._adminService.blockUser(userId);
            res.status(httpStatus.OK).json({ message: messages.USER_BLOCKED });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_USER });
        }
    }

    async unblockUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            await this._adminService.unblockUser(userId);
            res.status(httpStatus.OK).json({ message: messages.USER_UNBLOCKED });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_USER });
        }
    }

    async getAllCourses(req: Request, res: Response): Promise<void> {
        console.log('AdminController: getAllCourses called');
        try {
            const order = req.query.order as string;
            const params: GetAllCoursesParams = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10,
                sort: req.query.sort as string || 'createdAt',
                order: (order === 'asc' ? 'asc' : 'desc'),
                search: req.query.search as string || '',
                category: req.query.category as string || '',
                level: req.query.level as string || '',
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined
            };
            const courses = await this._adminService.getAllCourses(params);
            res.status(httpStatus.OK).json(courses);
        } catch (err) {
            console.error('AdminController getAllCourses error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.INTERNAL_SERVER_ERROR });
        }
    }

    async deleteCourse(req: Request, res: Response): Promise<void> {
        try {
            await this._adminService.deleteCourse(req.params.courseId);
            res.status(httpStatus.OK).json({ message: messages.COURSE_DELETED });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_DELETE });
        }
    }

    async updateCourseStatus(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;
            const { status } = req.body;
            await this._adminService.updateCourseStatus(courseId, status);
            res.status(httpStatus.OK).json({ message: messages.COURSE_STATUS_UPDATED });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_COURSE });
        }
    }

    // Category Management
    async getCategories(req: Request, res: Response): Promise<void> {
        console.log('AdminController: getCategories called');
        try {
            const categories = await this._adminService.getCategories();
            res.status(httpStatus.OK).json(categories);
        } catch (error: any) {
            console.error('AdminController getCategories error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_CATEGORIES, error: error.message });
        }
    }

    async createCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log('AdminController: createCategory called with body:', req.body);
            const { name } = req.body;
            const category = await this._adminService.createCategory(name);
            res.status(httpStatus.CREATED).json(category);
        } catch (error: any) {
            console.error('AdminController createCategory error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_CREATE_CATEGORY, error: error.message });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log('AdminController: updateCategory called with params:', req.params, 'body:', req.body);
            const { id } = req.params;
            const { name } = req.body;
            const category = await this._adminService.updateCategory(id, name);
            if (!category) {
                res.status(httpStatus.NOT_FOUND).json({ message: messages.CATEGORY_NOT_FOUND });
                return;
            }
            res.status(httpStatus.OK).json(category);
        } catch (error: any) {
            console.error('AdminController updateCategory error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UPDATE_CATEGORY, error: error.message });
        }
    }

    async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            console.log('AdminController: deleteCategory called with params:', req.params);
            const { id } = req.params;
            const category = await this._adminService.deleteCategory(id);
            if (!category) {
                res.status(httpStatus.NOT_FOUND).json({ message: messages.CATEGORY_NOT_FOUND });
                return;
            }
            res.status(httpStatus.OK).json({ message: messages.CATEGORY_DELETED });
        } catch (error: any) {
            console.error('AdminController deleteCategory error:', error);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_DELETE_CATEGORY, error: error.message });
        }
    }

    // Instructor Management
    async blockInstructor(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const instructor = await this._adminService.blockInstructor(id);
            res.status(httpStatus.OK).json({ message: messages.INSTRUCTOR_BLOCKED, instructor });
        } catch (error: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_BLOCK_INSTRUCTOR, error: error.message });
        }
    }

    async unblockInstructor(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const instructor = await this._adminService.unblockInstructor(id);
            res.status(httpStatus.OK).json({ message: messages.INSTRUCTOR_UNBLOCKED, instructor });
        } catch (error: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_UNBLOCK_INSTRUCTOR, error: error.message });
        }
    }

    async getProfile(req: Request, res: Response): Promise<void> {
        try {
            const adminPayload = req.user as { id: string };
            if (!adminPayload) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
                return;
            }
            const admin = await this._adminService.getProfile(adminPayload.id);
            if (!admin) {
                res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
                return;
            }
            res.status(httpStatus.OK).json(admin);
        } catch (err) {
            console.error('getProfile error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: messages.FAILED_TO_FETCH_USER, error: err instanceof Error ? err.message : err });
        }
    }

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            const adminPayload = req.user as { id: string };
            if (!adminPayload) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
                return;
            }
            const { name, username, phone, profilePicture } = req.body;
            const updated = await this._adminService.updateProfile(adminPayload.id, { name, username, phone, profilePicture });
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
            const adminPayload = req.user as { id: string };
            if (!adminPayload) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
                return;
            }
            const file = (req as any).file;
            if (!file || !file.path) {
                res.status(httpStatus.BAD_REQUEST).json({ message: messages.NO_FILE_UPLOADED });
                return;
            }
            const updated = await this._adminService.updateProfile(adminPayload.id, { profilePicture: file.path });
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
            const adminPayload = req.user as { id: string };
            if (!adminPayload) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: messages.UNAUTHORIZED });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.status(httpStatus.BAD_REQUEST).json({ message: messages.ALL_FIELDS_REQUIRED });
                return;
            }
            const result = await this._adminService.changePassword(adminPayload.id, currentPassword, newPassword);
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

    async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(httpStatus.BAD_REQUEST).json({ message: messages.TOKEN_REQUIRED });
                return;
            }
            const result = await this._adminService.refreshToken(refreshToken);
            res.status(httpStatus.OK).json(result);
        } catch (err: any) {
            res.status(httpStatus.UNAUTHORIZED).json({ message: err.message || messages.INVALID_OR_EXPIRED_TOKEN });
        }
    }

    async getUserDetailsWithProgress(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const details = await this._adminService.getUserDetailsWithProgress(userId);
            if (!details) {
                res.status(httpStatus.NOT_FOUND).json({ message: messages.USER_NOT_FOUND });
                return;
            }
            res.status(httpStatus.OK).json(details);
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async getCourseById(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;
            const course = await this._adminService.getCourseById(courseId);
            if (!course) {
                res.status(httpStatus.NOT_FOUND).json({ message: messages.COURSE_NOT_FOUND });
                return;
            }
            res.status(httpStatus.OK).json(course);
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async getUserActivityReport(req: Request, res: Response): Promise<void> {
        console.log('AdminController: getUserActivityReport called');
        try {
            const report = await this._adminService.getUserActivityReport();
            res.status(httpStatus.OK).json(report);
        } catch (err: any) {
            console.error('AdminController getUserActivityReport error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message, error: err });
        }
    }

    async getUserActivityReportByCourse(req: Request, res: Response): Promise<void> {
        try {
            const report = await this._adminService.getUserActivityReport();
            res.status(httpStatus.OK).json(report);
        } catch (err: any) {
            console.error('User Activity Report By Course Error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message, error: err });
        }
    }

    async getCoursePerformanceReport(req: Request, res: Response): Promise<void> {
        console.log('AdminController: getCoursePerformanceReport called');
        try {
            const report = await this._adminService.getCoursePerformanceReport();
            res.status(httpStatus.OK).json(report);
        } catch (err: any) {
            console.error('AdminController getCoursePerformanceReport error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async getStudentModuleProgress(req: Request, res: Response): Promise<void> {
        try {
            const { userId, courseId } = req.params;
            const progress = await this._adminService.getStudentModuleProgress(userId, courseId);
            res.status(httpStatus.OK).json(progress);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch student module progress' });
        }
    }

    async getCoursePerformance(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;
            const performance = await this._adminService.getCoursePerformance(courseId);
            res.status(httpStatus.OK).json(performance);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch course performance' });
        }
    }

    async getUserTrends(req: Request, res: Response): Promise<void> {
        console.log('AdminController: getUserTrends called');
        try {
            const trends = await this._adminService.getUserTrends();
            res.status(httpStatus.OK).json(trends);
        } catch (err: any) {
            console.error('AdminController getUserTrends error:', err);
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }

    async getCourseTrends(req: Request, res: Response): Promise<void> {
        try {
            const trends = await this._adminService.getCourseTrends();
            res.status(httpStatus.OK).json(trends);
        } catch (err: any) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: err.message });
        }
    }
}