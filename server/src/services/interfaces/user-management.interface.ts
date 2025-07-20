import { IUser } from '../../models/interfaces/auth.interface';

export interface IUserManagementService {
  // User CRUD operations
  getAllUsers(params: { 
    page: number; 
    limit: number; 
    search: string; 
    role: string; 
  }): Promise<{ 
    users: IUser[]; 
    total: number; 
    totalPages: number; 
    currentPage: number; 
  }>;
  
  getUserById(userId: string): Promise<IUser | null>;
  getUserDetailsWithProgress(userId: string): Promise<any>;
  
  // User status management
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  updateUserStatus(userId: string, blocked: boolean): Promise<void>;
  
  // User analytics
  getUserActivityReport(): Promise<any[]>;
  getUserStats(userId: string): Promise<any>;
} 