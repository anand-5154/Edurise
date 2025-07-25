import { IInstructor } from '../../models/interfaces/IInstructorAuth-interface';

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin: {
    id: string;
    email: string;
    name: string;
  };
}

export interface IAdminAuthService {
  // Authentication operations
  login(email: string, password: string): Promise<LoginResponse | null>;
  refreshToken(token: string): Promise<{ accessToken: string }>;
  
  // Admin profile management
  getProfile(adminId: string): Promise<any>;
  updateProfile(adminId: string, update: { 
    name?: string; 
    username?: string; 
    phone?: string; 
    profilePicture?: string; 
  }): Promise<any>;
  changePassword(adminId: string, currentPassword: string, newPassword: string): Promise<{ 
    success: boolean; 
    message?: string; 
  }>;
} 