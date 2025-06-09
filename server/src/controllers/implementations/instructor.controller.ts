import { IInstructorController } from "../interfaces/instructor.interface";
import { IInstructorService } from "../../services/interfaces/instructor.services";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";
import Instructor from "../../models/implementations/instructorModel";

export class InstructorController implements IInstructorController {
  constructor(private instructorService: IInstructorService) {}

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const course = await this.instructorService.createCourse(instructorId, req.body);
      res.status(httpStatus.CREATED).json(course);
    } catch (err) {
      console.error('Create course error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to create course",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      // Get the instructor ID from the decoded token
      const instructorId = req.user?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      // Check if instructor exists and is verified
      const instructor = await Instructor.findById(instructorId);
      if (!instructor) {
        res.status(httpStatus.NOT_FOUND).json({ message: "Instructor not found" });
        return;
      }

      if (!instructor.isVerified) {
        res.status(httpStatus.FORBIDDEN).json({ message: "Your account is pending verification" });
        return;
      }

      if (instructor.accountStatus !== "active") {
        res.status(httpStatus.FORBIDDEN).json({ message: "Your account is not active" });
        return;
      }

      const stats = await this.instructorService.getDashboardStats(instructorId);
      res.status(httpStatus.OK).json(stats);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch dashboard stats",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourses(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id;
      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const courses = await this.instructorService.getCourses(instructorId);
      res.status(httpStatus.OK).json(courses);
    } catch (err) {
      console.error('Get courses error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to fetch courses",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }

  async getCourseById(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id;
      const { courseId } = req.params;

      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const course = await this.instructorService.getCourseById(instructorId, courseId);
      
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

  async updateCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = req.user?.id;
      const { courseId } = req.params;

      if (!instructorId) {
        res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const course = await this.instructorService.updateCourse(instructorId, courseId, req.body);
      
      if (!course) {
        res.status(httpStatus.NOT_FOUND).json({ message: "Course not found" });
        return;
      }

      res.status(httpStatus.OK).json(course);
    } catch (err) {
      console.error('Update course error:', err);
      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
        message: "Failed to update course",
        error: err instanceof Error ? err.message : 'Unknown error'
      });
    }
  }
} 