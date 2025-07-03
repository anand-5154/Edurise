import { IUser } from "../../models/interfaces/auth.interface";
import { IInstructor } from "../../models/interfaces/instructorAuth.interface";
import { DashboardStats } from "../../services/interfaces/admin.services";

export interface IAdmin {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
}

export interface IAdminRepository {
    findByEmail(email: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser[]>;
    getAllInstructors(): Promise<IInstructor[]>;
    blockUser(userId: string): Promise<void>;
    unblockUser(userId: string): Promise<void>;
    getDashboardStats(): Promise<DashboardStats>;
    login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; admin: { id: string; email: string; name: string; }; } | null>;
    refreshToken(token: string): Promise<{ accessToken: string }>;
    getUserDetailsWithProgress(userId: string): Promise<any>;
}