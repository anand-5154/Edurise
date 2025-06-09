import { IAdminController } from "../interfaces/admin.interface";
import { IAdminService } from "../../services/interfaces/admin.services";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";
import { GetAllCoursesParams } from "../../services/interfaces/user.services";
import { AdminService } from '../../services/implementation/admin.sevices';

export class AdminController implements IAdminController {
    constructor(private adminService: IAdminService) {}

    async login(req: Request, res: Response): Promise<void> {
        const { email, password } = req.body;
        
        try {
            const result = await this.adminService.login(email, password);
            if (!result) {
                res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" });
                return;
            }
            res.status(httpStatus.OK).json(result);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Login failed" });
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';
            const role = req.query.role as string || '';

            const result = await this.adminService.getAllUsers({ page, limit, search, role });
            res.status(200).json(result);
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAllInstructors(req: Request, res: Response): Promise<void> {
        try {
            const instructors = await this.adminService.getAllInstructors();
            res.status(httpStatus.OK).json(instructors);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async verifyInstructor(req: Request, res: Response): Promise<void> {
        const { instructorId } = req.params;
        try {
            await this.adminService.verifyInstructor(instructorId);
            res.status(httpStatus.OK).json({ message: "Instructor verified successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async rejectInstructor(req: Request, res: Response): Promise<void> {
        const { instructorId } = req.params;
        try {
            await this.adminService.rejectInstructor(instructorId);
            res.status(httpStatus.OK).json({ message: "Instructor rejected successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const stats = await this.adminService.getDashboardStats();
            res.status(httpStatus.OK).json(stats);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async blockUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            await this.adminService.blockUser(userId);
            res.status(httpStatus.OK).json({ message: "User blocked successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to block user" });
        }
    }

    async unblockUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            await this.adminService.unblockUser(userId);
            res.status(httpStatus.OK).json({ message: "User unblocked successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to unblock user" });
        }
    }

    async getAllCourses(req: Request, res: Response): Promise<void> {
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
            const courses = await this.adminService.getAllCourses(params);
            res.status(httpStatus.OK).json(courses);
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async deleteCourse(req: Request, res: Response): Promise<void> {
        try {
            await this.adminService.deleteCourse(req.params.courseId);
            res.status(httpStatus.OK).json({ message: "Course deleted successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    async updateCourseStatus(req: Request, res: Response): Promise<void> {
        try {
            const { courseId } = req.params;
            const { status } = req.body;
            await this.adminService.updateCourseStatus(courseId, status);
            res.status(httpStatus.OK).json({ message: "Course status updated successfully" });
        } catch (err) {
            res.status(httpStatus.INTERNAL_SERVER_ERROR).json(err);
        }
    }

    // Category Management
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await this.adminService.getCategories();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching categories', error: error.message });
        }
    }

    async createCategory(req: Request, res: Response) {
        try {
            const { name } = req.body;
            const category = await this.adminService.createCategory(name);
            res.status(201).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error creating category', error: error.message });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await this.adminService.updateCategory(id, name);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json(category);
        } catch (error) {
            res.status(500).json({ message: 'Error updating category', error: error.message });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const category = await this.adminService.deleteCategory(id);
            if (!category) {
                return res.status(404).json({ message: 'Category not found' });
            }
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting category', error: error.message });
        }
    }
}