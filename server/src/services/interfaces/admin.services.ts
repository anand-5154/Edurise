import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "./user.services";
import { Category } from '../../models/Category';
import { IModule } from '../../models/implementations/moduleModel';

export interface DashboardStats {
    totalUsers: number;
    totalInstructors: number;
    totalCourses: number;
    pendingRequests: number;
    revenue: number;
}

export interface LoginResponse {
    token: string;
    admin: {
        id: string;
        email: string;
        name: string;
    };
}

export interface IAdminService{
    login(email: string, password: string): Promise<LoginResponse | null>;
    getDashboardStats(): Promise<DashboardStats>;
    getAllUsers(params: { page: number; limit: number; search: string; role: string }): Promise<{ users: IUser[]; total: number; totalPages: number; currentPage: number }>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
    getAllInstructors(params: { page: number; limit: number; search: string }): Promise<{ instructors: IInstructor[]; total: number; totalPages: number; currentPage: number }>;
    verifyInstructor(instructorId: string): Promise<void>;
    rejectInstructor(instructorId: string): Promise<void>;
    getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult>;
    deleteCourse(courseId: string): Promise<void>;
    updateCourseStatus(courseId: string, status: string): Promise<void>;
    getCategories(): Promise<Category[]>;
    createCategory(name: string): Promise<Category>;
    updateCategory(id: string, name: string): Promise<Category | null>;
    deleteCategory(id: string): Promise<Category | null>;
    refreshToken(token: string): Promise<{ accessToken: string }>;
    getUserDetailsWithProgress(userId: string): Promise<any>;
    getProfile(adminId: string): Promise<any>;
    updateProfile(adminId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }): Promise<any>;
    changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }>;
    getCourseById(courseId: string): Promise<any>;
    getUserActivityReport(): Promise<any>;
    getCoursePerformanceReport(): Promise<any>;
    blockInstructor(instructorId: string): Promise<void>;
    unblockInstructor(instructorId: string): Promise<void>;
    getStudentModuleProgress(userId: string, courseId: string): Promise<{ completedModules: number; totalModules: number; }>;
    getCoursePerformance(courseId: string): Promise<{ enrollments: number; }>;
}