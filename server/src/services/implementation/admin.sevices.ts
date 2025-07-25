import { IAdminService, DashboardStats, LoginResponse } from "../interfaces/IAdminService-interface";
import { AdminRepository } from "../../repository/implementations/admin.repository";
import { InstructorAuth } from "../../repository/implementations/instructorAuth.repository";
import { ICourseRepository } from "../../repository/interfaces/ICourseRepository-interface";
import { ICategoryRepository } from "../../repository/interfaces/ICategoryRepository-interface";
import { IModuleRepository } from "../../repository/interfaces/IModuleRepository-interface";
import { IUser } from "../../models/interfaces/IAuth-interface";
import { IInstructor } from "../../models/interfaces/IInstructorAuth-interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "../interfaces/IUserService-interface";
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../../utils/generateToken';
import { IUserRepository } from '../../repository/interfaces/IUserRepository-interface';
import { messages } from '../../constants/messages';
import User from '../../models/implementations/userModel';
import Instructor from '../../models/implementations/instructorModel';
import { PaymentService } from '../implementation/payment.service';

interface AdminUpdate {
  name?: string;
  username?: string;
  phone?: string;
  profilePicture?: string;
  refreshToken?: string;
}

export class AdminService implements IAdminService {
    constructor(
        private _adminRepository: AdminRepository,
        private _instructorRepository: InstructorAuth,
        private _courseRepository: ICourseRepository,
        private _paymentService: PaymentService, // Use PaymentService abstraction
        private _instructorAuthRepository: InstructorAuth,
        private _userRepository: IUserRepository,
        private _categoryRepository: ICategoryRepository,
        private _moduleRepository: IModuleRepository
    ) {}

    async login(email: string, password: string): Promise<LoginResponse | null> {
        const admin = await this._adminRepository.login(email, password);
        if (!admin) return null;

        // Generate tokens
        const accessToken = generateAccessToken(admin._id.toString(), 'admin');
        const refreshToken = jwt.sign(
            { id: admin._id },
            process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
            { expiresIn: '7d' }
        );

        // Save the new refresh token in DB
        await this._adminRepository.updateRefreshTokenById(admin._id, refreshToken);

        // Return tokens and admin info
        return {
            admin: {
                id: admin.admin.id,
                email: admin.admin.email,
                name: admin.admin.name
            },
            accessToken,
            refreshToken
        };
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
        console.log('AdminService: getAllCourses called');
        try {
            return this._courseRepository.getCoursesWithPagination(params, true);
        } catch (err) {
            console.error('AdminService getAllCourses error:', err);
            throw err;
        }
    }

    async deleteCourse(courseId: string): Promise<void> {
        // If deleteCourse is not present in ICourseRepository, comment this out and add a TODO
        // await this._courseRepository.deleteCourse(courseId);
        // TODO: Implement deleteCourse in ICourseRepository or update this call
    }

    async updateCourseStatus(courseId: string, status: string): Promise<void> {
        await this._courseRepository.updateCourseStatus(courseId, status === "approved");
    }

    async getCourseById(courseId: string) {
        return this._courseRepository.findById(courseId);
    }

    // Category Management
    async getCategories(): Promise<any[]> {
        console.log('AdminService: getCategories called');
        try {
            return await this._categoryRepository.findAll();
        } catch (err) {
            console.error('AdminService getCategories error:', err);
            throw err;
        }
    }

    async createCategory(name: string): Promise<any> {
        console.log('AdminService: createCategory called with name:', name);
        try {
            return await this._categoryRepository.create(name);
        } catch (err) {
            console.error('AdminService createCategory error:', err);
            throw err;
        }
    }

    async updateCategory(id: string, name: string): Promise<any | null> {
        console.log('AdminService: updateCategory called with id:', id, 'name:', name);
        try {
            return await this._categoryRepository.update(id, name);
        } catch (err) {
            console.error('AdminService updateCategory error:', err);
            throw err;
        }
    }

    async deleteCategory(id: string): Promise<any | null> {
        console.log('AdminService: deleteCategory called with id:', id);
        try {
            return await this._categoryRepository.delete(id);
        } catch (err) {
            console.error('AdminService deleteCategory error:', err);
            throw err;
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

    async refreshToken(token: string): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key') as { id: string };
            const admin = await this._adminRepository.findById(decoded.id);

            console.log('Decoded admin ID:', decoded.id);
            console.log('Admin refreshToken in DB:', admin?.refreshToken);
            console.log('Provided refreshToken:', token);

            if (!admin || admin.refreshToken !== token) {
                throw new Error('Invalid refresh token');
            }

            const accessToken = generateAccessToken((admin._id as string), 'admin');
            // Generate a new refresh token
            const newRefreshToken = jwt.sign(
                { id: admin._id as string },
                process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
                { expiresIn: '7d' }
            );
            // Save the new refresh token in DB
            await this._adminRepository.updateRefreshTokenById(admin._id as string, newRefreshToken);

            return { accessToken, refreshToken: newRefreshToken };
        } catch (error: any) {
            console.error('Admin refreshToken error:', error);
            throw new Error('Invalid refresh token');
        }
    }

    async getUserDetailsWithProgress(userId: string): Promise<any> {
        return this._adminRepository.getUserDetailsWithProgress(userId);
    }

    async getUserActivityReport(): Promise<any> {
        console.log('AdminService: getUserActivityReport called');
        try {
            return this._userRepository.getUserActivityReport();
        } catch (err) {
            console.error('AdminService getUserActivityReport error:', err);
            throw err;
        }
    }

    async getUserActivityReportByCourse(): Promise<any[]> {
        return this._userRepository.getUserActivityReportByCourse();
    }

    async getCoursePerformanceReport(): Promise<any> {
        console.log('AdminService: getCoursePerformanceReport called');
        try {
            return this._courseRepository.getCoursePerformanceReport();
        } catch (err) {
            console.error('AdminService getCoursePerformanceReport error:', err);
            throw err;
        }
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

    async getUserTrends(): Promise<any> {
        console.log('AdminService: getUserTrends called');
        try {
            const topEnrolled = await this._userRepository.getTopUsersByEnrollments(3);
            const topCompleted = await this._userRepository.getTopUsersByCompletions(3);
            return {
                topEnrolled,
                topCompleted,
            };
        } catch (err) {
            console.error('AdminService getUserTrends error:', err);
            throw err;
        }
    }

    // Remove getTopCoursesByEnrollments/getTopCoursesByCompletions usage
    async getCourseTrends(): Promise<{ topEnrolled: any[]; topCompleted: any[] }> {
        const topEnrolled = await this._courseRepository.getTopCoursesByEnrollments(3);
        const topCompleted = await this._courseRepository.getTopCoursesByCompletions(3);
        return {
            topEnrolled,
            topCompleted,
        };
    }

    // Payment-related admin methods
    async getPaymentStats(): Promise<any> {
        return this._paymentService.getPaymentStats();
    }

    async getPaymentHistory(userId?: string): Promise<any[]> {
        return this._paymentService.getPaymentHistory(userId);
    }
}