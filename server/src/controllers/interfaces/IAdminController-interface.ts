import { Request, Response } from "express";

export interface IAdminController {
    login(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
    blockUser(req: Request, res: Response): Promise<void>;
    unblockUser(req: Request, res: Response): Promise<void>;
    getAllInstructors(req: Request, res: Response): Promise<void>;
    verifyInstructor(req: Request, res: Response): Promise<void>;
    rejectInstructor(req: Request, res: Response): Promise<void>;
    getAllCourses(req: Request, res: Response): Promise<void>;
    deleteCourse(req: Request, res: Response): Promise<void>;
    updateCourseStatus(req: Request, res: Response): Promise<void>;
    getCategories(req: Request, res: Response): Promise<void>;
    createCategory(req: Request, res: Response): Promise<void>;
    updateCategory(req: Request, res: Response): Promise<void>;
    deleteCategory(req: Request, res: Response): Promise<void>;
}