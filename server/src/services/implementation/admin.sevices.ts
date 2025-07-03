import { IAdminService, DashboardStats, LoginResponse } from "../interfaces/admin.services";
import { AdminRepository } from "../../repository/implementations/admin.repository";
import { InstructorAuth } from "../../repository/implementations/instructorAuth.repository";
import { CourseRepository } from "../../repository/implementations/course.repository";
import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "../interfaces/user.services";
import Instructor from "../../models/implementations/instructorModel";
import User from "../../models/implementations/userModel";
import { Category as CategoryModel } from '../../models/Category';
import { ICategory } from "../../models/interfaces/category.interface";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../../utils/generateToken';

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
    async getCategories(): Promise<ICategory[]> {
        return await CategoryModel.find().sort({ createdAt: -1 });
    }

    async createCategory(name: string): Promise<ICategory> {
        const category = new CategoryModel({ name });
        return await category.save();
    }

    async updateCategory(id: string, name: string): Promise<ICategory | null> {
        return await CategoryModel.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );
    }

    async deleteCategory(id: string): Promise<ICategory | null> {
        return await CategoryModel.findByIdAndDelete(id);
    }

    // Instructor Management
    async getAllInstructors(params: { page: number; limit: number; search: string }): Promise<{ instructors: IInstructor[]; total: number; totalPages: number; currentPage: number }> {
        const { page, limit, search } = params;
        
        // Build query
        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get total count
        const total = await Instructor.countDocuments(query);
        
        // Get instructors with pagination
        const instructors = await Instructor.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        return {
            instructors,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    async blockInstructor(instructorId: string): Promise<IInstructor> {
        const instructor = await Instructor.findByIdAndUpdate(
            instructorId,
            { blocked: true },
            { new: true }
        ).select('-password');

        if (!instructor) {
            throw new Error('Instructor not found');
        }

        return instructor;
    }

    async unblockInstructor(instructorId: string): Promise<IInstructor> {
        const instructor = await Instructor.findByIdAndUpdate(
            instructorId,
            { blocked: false },
            { new: true }
        ).select('-password');

        if (!instructor) {
            throw new Error('Instructor not found');
        }

        return instructor;
    }

    async getProfile(adminId: string) {
        return this.adminRepository.findById(adminId);
    }

    async updateProfile(adminId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
        return this.adminRepository.updateById(adminId, update);
    }

    async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
        const admin = await this.adminRepository.findById(adminId);
        if (!admin) {
            return { success: false, message: 'Admin not found' };
        }
        if (admin.password) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return { success: false, message: 'Current password is incorrect' };
            }
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.adminRepository.updatePasswordById(adminId, hashed);
        return { success: true };
    }

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        return this.adminRepository.refreshToken(token);
    }

    async getUserDetailsWithProgress(userId: string): Promise<any> {
        return this.adminRepository.getUserDetailsWithProgress(userId);
    }
}