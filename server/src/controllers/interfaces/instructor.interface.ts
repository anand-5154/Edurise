import { Request, Response } from 'express';

export interface IInstructorController {
  createCourse(req: Request, res: Response): Promise<void>;
  getDashboardStats(req: Request, res: Response): Promise<void>;
  getCourses(req: Request, res: Response): Promise<void>;
  getCourseById(req: Request, res: Response): Promise<void>;
  updateCourse(req: Request, res: Response): Promise<void>;
} 