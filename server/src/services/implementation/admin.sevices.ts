import { IAdminService, DashboardStats, LoginResponse } from "../interfaces/admin.services";
import { AdminRepository } from "../../repository/implementations/admin.repository";
import { InstructorAuth } from "../../repository/implementations/instructorAuth.repository";
import { CourseRepository } from "../../repository/implementations/course.repository";
import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "../interfaces/user.services";
import { ICategoryRepository } from '../../repository/interfaces/category.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../../utils/generateToken';
import { UserRepository } from "../../repository/implementations/user.repository";
import { messages } from '../../constants/messages';
import { IModuleRepository } from '../../repository/interfaces/module.repository';
import User from '../../models/implementations/userModel';
import Instructor from '../../models/implementations/instructorModel';

export class AdminService implements IAdminService {
    constructor(
        private _adminRepository: AdminRepository,
        private _instructorRepository: InstructorAuth,
        private _courseRepository: CourseRepository,
        private _instructorAuthRepository: InstructorAuth,
        private _userRepository: UserRepository,
        private _categoryRepository: ICategoryRepository,
        private _moduleRepository: IModuleRepository
    ) {}

    async login(email: string, password: string): Promise<LoginResponse | null> {
        return this._adminRepository.login(email, password);
    }

    async getDashboardStats(): Promise<DashboardStats> {
        return this._adminRepository.getDashboardStats();
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
        await this._adminRepository.blockUser(userId);
    }

    async unblockUser(userId: string): Promise<void> {
        await this._adminRepository.unblockUser(userId);
    }

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

    async verifyInstructor(instructorId: string): Promise<void> {
        await this._instructorRepository.verifyInstructor(instructorId);
    }

    async rejectInstructor(instructorId: string): Promise<void> {
        await this._instructorRepository.rejectInstructor(instructorId);
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
        const total = await this._courseRepository.countCourses(query);
        
        // Get courses with pagination and sorting
        const courses = await this._courseRepository.getCourses({
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
        await this._courseRepository.deleteCourse(courseId);
    }

    async updateCourseStatus(courseId: string, status: string): Promise<void> {
        const isPublished = status === 'published';
        await this._courseRepository.updateCourseStatus(courseId, isPublished);
    }

    async getCourseById(courseId: string) {
        return this._courseRepository.getCourseById(courseId);
    }

    // Category Management
    async getCategories(): Promise<any[]> {
        try {
            console.log('AdminService: getCategories called');
            return await this._categoryRepository.findAll();
        } catch (error) {
            console.error('AdminService getCategories error:', error);
            throw error;
        }
    }

    async createCategory(name: string): Promise<any> {
        try {
            console.log('AdminService: createCategory called with name:', name);
            return await this._categoryRepository.create(name);
        } catch (error) {
            console.error('AdminService createCategory error:', error);
            throw error;
        }
    }

    async updateCategory(id: string, name: string): Promise<any | null> {
        try {
            console.log('AdminService: updateCategory called with id:', id, 'name:', name);
            return await this._categoryRepository.update(id, name);
        } catch (error) {
            console.error('AdminService updateCategory error:', error);
            throw error;
        }
    }

    async deleteCategory(id: string): Promise<any | null> {
        try {
            console.log('AdminService: deleteCategory called with id:', id);
            return await this._categoryRepository.delete(id);
        } catch (error) {
            console.error('AdminService deleteCategory error:', error);
            throw error;
        }
    }

    // Instructor Management
    async blockInstructor(instructorId: string): Promise<void> {
        const instructor = await Instructor.findByIdAndUpdate(
            instructorId,
            { blocked: true },
            { new: true }
        ).select('-password');

        if (!instructor) {
            throw new Error(messages.INSTRUCTOR_NOT_FOUND);
        }
        // No return value needed
    }

    async unblockInstructor(instructorId: string): Promise<void> {
        const instructor = await Instructor.findByIdAndUpdate(
            instructorId,
            { blocked: false },
            { new: true }
        ).select('-password');

        if (!instructor) {
            throw new Error(messages.INSTRUCTOR_NOT_FOUND);
        }
        // No return value needed
    }

    async getProfile(adminId: string) {
        return this._adminRepository.findById(adminId);
    }

    async updateProfile(adminId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
        return this._adminRepository.updateById(adminId, update);
    }

    async changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
        const admin = await this._adminRepository.findById(adminId);
        if (!admin) {
            return { success: false, message: messages.USER_NOT_FOUND };
        }
        if (admin.password) {
            const isMatch = await bcrypt.compare(currentPassword, admin.password);
            if (!isMatch) {
                return { success: false, message: messages.PASSWORD_INCORRECT };
            }
        }
        // Password strength validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return { success: false, message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.' };
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await this._adminRepository.updatePasswordById(adminId, hashed);
        return { success: true };
    }

    async refreshToken(token: string): Promise<{ accessToken: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
            const admin = await this._adminRepository.findById(decoded.id);

            // Debug logging
            console.log('Decoded admin ID:', decoded.id);
            console.log('Admin refreshToken in DB:', admin?.refreshToken);
            console.log('Provided refreshToken:', token);

            if (!admin || admin.refreshToken !== token) {
                throw new Error('Invalid refresh token');
            }
            const accessToken = generateAccessToken(admin._id.toString(), 'admin');
            return { accessToken };
        } catch (error: any) {
            console.error('Admin refreshToken error:', error);
            throw new Error('Invalid refresh token');
        }
    }

    async getUserDetailsWithProgress(userId: string): Promise<any> {
        return this._adminRepository.getUserDetailsWithProgress(userId);
    }

    async getUserActivityReport(): Promise<any> {
        return this._userRepository.getUserActivityReport();
    }

    async getUserActivityReportByCourse(): Promise<any[]> {
        return this._userRepository.getUserActivityReportByCourse();
    }

    async getCoursePerformanceReport() {
        return this._courseRepository.getCoursePerformanceReport();
    }

    async getStudentModuleProgress(userId: string, courseId: string): Promise<{ completedModules: number; totalModules: number; }> {
        const modules = await this._moduleRepository.findByCourse(courseId);
        // TODO: Use ModuleProgress or LectureProgress to count completed modules
        const completedModules = 0; // Placeholder
        return { completedModules, totalModules: modules.length };
    }

    async getCoursePerformance(courseId: string): Promise<{ enrollments: number; }> {
        // Assume EnrollmentRepository is available
        // const enrollments = await this._enrollmentRepository.countEnrollments({ course: courseId });
        const enrollments = 0; // Placeholder
        return { enrollments };
    }
}