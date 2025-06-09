import { Request, Response } from 'express';
import { AdminService } from '../services/implementation/admin.sevices';
import { AdminRepository } from '../repository/implementations/admin.repository';
import { InstructorAuth } from '../repository/implementations/instructorAuth.repository';
import { CourseRepository } from '../repository/implementations/course.repository';

const adminRepository = new AdminRepository();
const instructorRepository = new InstructorAuth();
const courseRepository = new CourseRepository();
const adminService = new AdminService(adminRepository, instructorRepository, courseRepository, instructorRepository);

export class AdminController {
  constructor(private adminService: AdminService) {}

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.adminService.login(email, password);
      
      if (!result) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.adminService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getAllTutors = async (req: Request, res: Response) => {
    try {
      const tutors = await this.adminService.getAllTutors();
      res.json(tutors);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  blockUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      await this.adminService.blockUser(userId);
      res.json({ message: 'User blocked successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  unblockUser = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      await this.adminService.unblockUser(userId);
      res.json({ message: 'User unblocked successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  verifyInstructor = async (req: Request, res: Response) => {
    try {
      const { instructorId } = req.params;
      await this.adminService.verifyInstructor(instructorId);
      res.json({ message: 'Instructor verified successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  rejectInstructor = async (req: Request, res: Response) => {
    try {
      const { instructorId } = req.params;
      await this.adminService.rejectInstructor(instructorId);
      res.json({ message: 'Instructor rejected successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  getAllCourses = async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const courses = await this.adminService.getAllCourses({
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        sort: 'createdAt',
        order: 'desc'
      });
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  deleteCourse = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      await this.adminService.deleteCourse(courseId);
      res.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  updateCourseStatus = async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { status } = req.body;
      await this.adminService.updateCourseStatus(courseId, status);
      res.json({ message: 'Course status updated successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}

export default new AdminController(adminService); 