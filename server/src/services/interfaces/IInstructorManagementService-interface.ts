import { IInstructor } from '../../models/interfaces/IInstructorAuth-interface';

export interface IInstructorManagementService {
  // Instructor CRUD operations
  getAllInstructors(params: { 
    page: number; 
    limit: number; 
    search: string; 
  }): Promise<{ 
    instructors: IInstructor[]; 
    total: number; 
    totalPages: number; 
    currentPage: number; 
  }>;
  
  getInstructorById(instructorId: string): Promise<IInstructor | null>;
  
  // Instructor approval workflow
  verifyInstructor(instructorId: string): Promise<void>;
  rejectInstructor(instructorId: string): Promise<void>;
  blockInstructor(instructorId: string): Promise<void>;
  unblockInstructor(instructorId: string): Promise<void>;
  
  // Instructor analytics
  getInstructorStats(instructorId: string): Promise<any>;
  getPendingInstructorRequests(): Promise<IInstructor[]>;
} 