import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { GetAllCoursesParams, GetAllCoursesResult } from "./user.services";
import { Category } from '../../models/Category';

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
    getAllInstructors(): Promise<IInstructor[]>;
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
}