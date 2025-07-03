import { IInstructorController } from "../interfaces/instructor.interface";
import { IInstructorService } from "../../services/interfaces/instructor.services";
import { Request, Response } from "express";
import { httpStatus } from "../../constants/statusCodes";
import Instructor from "../../models/implementations/instructorModel";
import LectureProgress from '../../models/implementations/lectureProgressModel';
import User from '../../models/implementations/userModel';
import Enrollment from '../../models/implementations/enrollmentModel';

interface JwtPayload {
  id: string;
  role: string;
}

export class InstructorController implements IInstructorController {
  constructor(private instructorService: IInstructorService) {}

  async createCourse(req: Request, res: Response): Promise<void> {
    try {
      const instructorId = (req.user as JwtPayload)?.id;
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
      const instructorId = (req.user as JwtPayload)?.id;
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

      if (instructor.accountStatus !== "approved") {
        res.status(httpStatus.FORBIDDEN).json({ message: "Your account is not approved" });
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
      const instructorId = (req.user as JwtPayload)?.id;
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
      const instructorId = (req.user as JwtPayload)?.id;
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
      const instructorId = (req.user as JwtPayload)?.id;
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

  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const instructor = await this.instructorService.getProfile(instructorPayload.id);
      if (!instructor) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
      }
      res.status(200).json(instructor);
    } catch (err) {
      console.error('getProfile error:', err);
      res.status(500).json({ message: 'Failed to fetch profile', error: err instanceof Error ? err.message : err });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    console.log('Instructor updateProfile called');
    console.log('Instructor updateProfile called with:', req.body);
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { name, username, phone, profilePicture } = req.body;
      const updated = await this.instructorService.updateProfile(instructorPayload.id, { name, username, phone, profilePicture });
      if (!updated) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
      }
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      // @ts-ignore
      if (!req.file || !req.file.path) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      console.log('Uploading profile picture for instructor:', instructorPayload.id, 'URL:', req.file.path);
      const updated = await this.instructorService.updateProfile(instructorPayload.id, { profilePicture: req.file.path });
      console.log('Updated instructor after profile picture upload:', updated);
      if (!updated) {
        res.status(404).json({ message: 'Instructor not found' });
        return;
      }
      res.status(200).json({ profilePicture: updated.profilePicture });
    } catch (err) {
      console.error('Upload profile picture error:', err);
      res.status(500).json({ 
        message: 'Failed to upload profile picture', 
        error: err instanceof Error ? err.message : err 
      });
    }
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // @ts-ignore
      const instructorPayload = req.user;
      if (!instructorPayload) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }
      const result = await this.instructorService.changePassword(instructorPayload.id, currentPassword, newPassword);
      if (result.success) {
        res.status(200).json({ message: 'Password changed successfully' });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ message: 'Failed to change password' });
    }
  }

  // Get all students' lecture progress for a course
  async getCourseLectureProgress(req: Request, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      // Get all students enrolled in the course
      const enrollments = await Enrollment.find({ course: courseId, status: 'completed' }).populate('student', 'name email');
      const students = enrollments.map(e => e.student);
      // Get all lecture progress for this course
      const progress = await LectureProgress.find({ course: courseId });
      // Map: studentId -> Set of completed lecture indices
      const progressMap = {};
      progress.forEach(p => {
        const sid = p.student.toString();
        if (!progressMap[sid]) progressMap[sid] = new Set();
        progressMap[sid].add(p.lectureIndex);
      });
      // Build result
      const result = students.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email,
        completedLectures: Array.from(progressMap[student._id.toString()] || [])
      }));
      res.status(200).json({ students: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
} 