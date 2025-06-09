import { Request, Response } from 'express';
import { IUserController } from '../../controllers/interfaces/user.controller';
import { IUserService } from '../../services/interfaces/user.services';
import httpStatus from '../../utils/statusCodes';
import { Category } from '../../models/Category';

export class UserController implements IUserController {
  constructor(private userService: IUserService) {}

  async getAllCourses(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search = '', category = '', level = '', minPrice = '', maxPrice = '' } = req.query;
      
      const courses = await this.userService.getAllCourses({
        page: Number(page),
        limit: Number(limit),
        sort: String(sort),
        order: String(order) as 'asc' | 'desc',
        search: String(search),
        category: String(category),
        level: String(level),
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined
      });
      
      res.status(httpStatus.OK).json(courses);
    } catch (err) {
      console.error('Get all courses error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch courses",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const course = await this.userService.getCourseById(courseId);
      
      if (!course) {
        res.status(httpStatus.NOT_FOUND).json({ message: "Course not found" });
        return;
      }

      res.status(httpStatus.OK).json(course);
    } catch (err) {
      console.error('Get course by ID error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch course",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find().sort({ name: 1 });
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
  }
} 