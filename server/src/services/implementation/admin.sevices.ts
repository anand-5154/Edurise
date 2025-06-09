import { IAdminService, DashboardStats, LoginResponse } from "../interfaces/admin.services";
import { AdminRepository } from "../../repository/implementations/admin.repository";
import { InstructorAuth } from "../../repository/implementations/instructorAuth.repository";
import { CourseRepository } from "../../repository/implementations/course.repository";
import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "../interfaces/user.services";
import Instructor from "../../models/implementations/instructorModel";
import User from "../../models/implementations/userModel";
import { Category } from '../../models/Category';

export class AdminService implements IAdminService {
    constructor(
        private adminRepository: AdminRepository,
        private instructorRepository: InstructorAuth,
        private courseRepository: CourseRepository,
        private instructorAuthRepository: InstructorAuth
    ) {}

    async login(email: string, password: string): Promise<LoginResponse | null> {
        return this.adminRepository.login(email, password);
    }

    async getDashboardStats(): Promise<DashboardStats> {
        return this.adminRepository.getDashboardStats();
    }

    async getAllUsers(params: { page: number; limit: number; search: string; role: string }): Promise<{ users: IUser[]; total: number; totalPages: number; currentPage: number }> {
        const { page, limit, search, role } = params;
        
        // Build query
        const query: any = {};
        
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
        const total = await User.countDocuments(query);
        
        // Get users with pagination
        const users = await User.find(query)
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

    async blockUser(userId: string): Promise<void> {
        await this.adminRepository.blockUser(userId);
    }

    async unblockUser(userId: string): Promise<void> {
        await this.adminRepository.unblockUser(userId);
    }

    async getAllInstructors(): Promise<IInstructor[]> {
        return this.adminRepository.getAllInstructors();
    }

    async verifyInstructor(instructorId: string): Promise<void> {
        await this.instructorRepository.verifyInstructor(instructorId);
    }

    async rejectInstructor(instructorId: string): Promise<void> {
        await this.instructorRepository.rejectInstructor(instructorId);
    }

    async getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult> {
        const { page, limit, sort, order, search, category, level } = params;
        
        // Build query
        const query: any = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.category = category;
        }
        
        if (level) {
            query.level = level;
        }
        
        // Get total count
        const total = await this.courseRepository.countCourses(query);
        
        // Get courses with pagination and sorting
        const courses = await this.courseRepository.getCourses({
            query,
            page,
            limit,
            sort,
            order
        });
        
        return {
            courses,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    async deleteCourse(courseId: string): Promise<void> {
        await this.courseRepository.deleteCourse(courseId);
    }

    async updateCourseStatus(courseId: string, status: string): Promise<void> {
        const isPublished = status === 'published';
        await this.courseRepository.updateCourseStatus(courseId, isPublished);
    }

    // Category Management
    async getCategories(): Promise<Category[]> {
        return await Category.find().sort({ createdAt: -1 });
    }

    async createCategory(name: string): Promise<Category> {
        const category = new Category({ name });
        return await category.save();
    }

    async updateCategory(id: string, name: string): Promise<Category | null> {
        return await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
    }

    async deleteCategory(id: string): Promise<Category | null> {
        return await Category.findByIdAndDelete(id);
    }
}