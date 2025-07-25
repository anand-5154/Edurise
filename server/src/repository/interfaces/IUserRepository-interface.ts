import { IUser } from '../../models/interfaces/IAuth-interface';

export interface IUserRepository {
  // Basic CRUD operations
  createUser(userData: Partial<IUser>): Promise<IUser>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  updateById(id: string, update: Partial<IUser>): Promise<IUser | null>;
  deleteById(id: string): Promise<void>;
  
  // User-specific operations
  findUsersByRole(role: string): Promise<IUser[]>;
  findBlockedUsers(): Promise<IUser[]>;
  findActiveUsers(): Promise<IUser[]>;
  updateUserStatus(id: string, blocked: boolean): Promise<IUser | null>;
  
  // Search and pagination
  findUsersWithPagination(params: {
    page: number;
    limit: number;
    search?: string;
    role?: string;
  }): Promise<{
    users: IUser[];
    total: number;
    totalPages: number;
    currentPage: number;
  }>;
  
  // User activity and analytics
  getUserActivityReport(): Promise<any[]>;
  getUserEnrollmentStats(userId: string): Promise<any>;
  getTopUsersByEnrollments(limit?: number): Promise<any[]>;
  getTopUsersByCompletions(limit?: number): Promise<any[]>;
  getUserActivityReportByCourse(): Promise<any[]>;
} 