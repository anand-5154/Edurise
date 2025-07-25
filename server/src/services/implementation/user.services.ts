import { IUserService, GetAllCoursesParams, GetAllCoursesResult } from '../interfaces/user.services';
import { ICourseRepository } from '../../repository/interfaces/course.repository';
import { IUserRepository } from '../../repository/interfaces/IUserRepository-interface';
import { ICourse } from '../../models/implementations/courseModel';
import bcrypt from 'bcrypt';
import { messages } from '../../constants/messages';
import { IModuleRepository } from '../../repository/interfaces/module.repository';
import { ILectureRepository } from '../../repository/interfaces/lecture.repository';
import { ICategoryRepository } from '../../repository/interfaces/category.repository';
import mongoose from 'mongoose';
import { LectureProgressRepository } from '../../repository/implementations/lectureProgress.repository';
import { LearningPathRepository } from '../../repository/implementations/learningPath.repository';
import { IEnrollmentRepository } from '../../repository/interfaces/enrollment.interface';
import { IModule } from '../../models/implementations/moduleModel';
import { ILecture } from '../../models/implementations/lectureModel';

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private courseRepository: ICourseRepository,
    private moduleRepository: IModuleRepository,
    private lectureRepository: ILectureRepository,
    private categoryRepository: ICategoryRepository,
    private enrollmentRepository: IEnrollmentRepository,
    private lectureProgressRepository: LectureProgressRepository, // Add the lecture progress repository
    private learningPathRepository: LearningPathRepository
  ) {}

  async getAllCourses(params: GetAllCoursesParams): Promise<GetAllCoursesResult> {
    return this.courseRepository.getCoursesWithPagination(params);
  }

  async getCourseById(courseId: string): Promise<ICourse | null> {
    return this.courseRepository.findByIdIfPublished(courseId);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { success: false, message: messages.USER_NOT_FOUND };
    }
    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return { success: false, message: messages.PASSWORD_INCORRECT };
      }
    }
    // Allow Google users (no password) to set a password
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepository.updateById(userId, { password: hashed });
    return { success: true };
  }

  async getProfile(userId: string) {
    return this.userRepository.findById(userId);
  }

  async updateProfile(userId: string, update: { name?: string; username?: string; phone?: string; profilePicture?: string }) {
    return this.userRepository.updateById(userId, update);
  }

  async getModulesForCourse(courseId: string, userId: string): Promise<{ modules: IModule[], unlocked: boolean[], completed: boolean[] }> {
    try {
      console.log('[getModulesForCourse] called with courseId:', courseId, 'userId:', userId);
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.error('[getModulesForCourse] Invalid courseId:', courseId);
        throw new Error('Invalid courseId');
      }
      const course = await this.courseRepository.findByIdIfPublished(courseId);
      if (!course) {
        throw new Error('Course not found');
      }
      const modules: IModule[] = (course.modules as any) || [];
      console.log('[getModulesForCourse] modules found:', modules.length);
      // Get all completed lectures for this user and course
      const progressDocs = await this.lectureProgressRepository.findByUserAndCourse(userId, courseId);
      const completedLectureIds = new Set(progressDocs.map((p: any) => p.lecture.toString()));
      // For each module, check if all lectures are completed
      const completed: boolean[] = modules.map((mod: IModule) =>
        mod.lectures.length > 0 && mod.lectures.every((lec: ILecture) => completedLectureIds.has(lec._id.toString()))
      );
      // Unlock logic: first module always unlocked, next unlocked if previous is completed
      const unlocked: boolean[] = modules.map((_, idx) => {
        if (idx === 0) return true;
        return completed[idx - 1];
      });
      return { modules, unlocked, completed };
    } catch (error) {
      console.error('[getModulesForCourse] error:', error, 'courseId:', courseId, 'userId:', userId);
      throw error;
    }
  }

  async getLecturesForModule(moduleId: string, userId: string): Promise<{ lectures: ILecture[], completed: boolean[] }> {
    // Always use ObjectId for the query
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(moduleId);
    } catch (e) {
      console.error('[getLecturesForModule] Invalid moduleId:', moduleId);
      throw new Error('Invalid moduleId');
    }
    const course = await this.courseRepository.findOne({ 'modules._id': objectId });
    if (!course) {
      console.error('[getLecturesForModule] No course found with moduleId:', moduleId);
      throw new Error('Module not found');
    }
    // Log all module IDs in the found course
    const moduleIdStr = moduleId.toString().trim();
    const allModuleIds = course.modules.map((m: IModule) => m._id && m._id.toString());
    console.log('[getLecturesForModule] Looking for moduleId:', moduleIdStr);
    console.log('[getLecturesForModule] Course found. Module IDs:', allModuleIds);
    const module: IModule | undefined = (course.modules as any).find((m: any) => m._id && m._id.toString() === moduleIdStr);
    if (!module) {
      console.error('[getLecturesForModule] Module not found in course. moduleId:', moduleIdStr, 'All IDs:', allModuleIds);
      throw new Error('Module not found');
    }
    const lectures: ILecture[] = (module.lectures as any) || [];
    // Fetch completed lectures for this user and module
    const progressDocs = await this.lectureProgressRepository.findByUserAndModule(userId, moduleId);
    const completedLectureIds = new Set(progressDocs.map((p: any) => p.lecture.toString()));
    const completed: boolean[] = lectures.map((l: any) => l._id && completedLectureIds.has(l._id.toString()));
    return { lectures, completed };
  }

  async completeLecture(userId: string, moduleId: string, lectureId: string): Promise<void> {
    // Find the course that contains the module
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(moduleId);
    } catch (e) {
      console.error('[completeLecture] Invalid moduleId:', moduleId);
      throw new Error('Invalid moduleId');
    }
    const course = await this.courseRepository.findOne({ 'modules._id': objectId });
    if (!course) throw new Error('Module not found');
    const module = course.modules.find((m: IModule) => m._id && m._id.toString() === moduleId);
    if (!module) throw new Error('Module not found');
    // Add logging here
    const allLectureIds = module.lectures.map((l: ILecture) => l._id && l._id.toString());
    console.log('[completeLecture] Looking for lectureId:', lectureId);
    console.log('[completeLecture] All lecture IDs in module:', allLectureIds);
    const lecture = module.lectures.find((l: ILecture) => l._id && l._id.toString() === lectureId);
    if (!lecture) {
      console.error('[completeLecture] Lecture not found. lectureId:', lectureId, 'All IDs:', allLectureIds);
      throw new Error('Lecture not found');
    }
    await this.lectureProgressRepository.markCompleted(userId, course._id, moduleId, lectureId);
  }

  async getModuleProgress(userId: string, courseId: string): Promise<{ unlocked: boolean[], completed: boolean[] }> {
    // TODO: Implement real progress logic
    return { unlocked: [], completed: [] };
  }

  async getAllCategories(): Promise<any[]> {
    return this.categoryRepository.findAll();
  }

  async isEnrolledInCourse(userId: string, courseId: string): Promise<boolean> {
    // Use the enrollment repository to check if the user is enrolled in the course
    // Only return true if the enrollment exists and status is 'completed'
    // (Assume you have an enrollmentRepository injected; if not, add it)
    if (!this['enrollmentRepository']) {
      throw new Error('enrollmentRepository not injected');
    }
    const enrollment = await this['enrollmentRepository'].findEnrollmentByStudentAndCourse(userId, courseId);
    return !!(enrollment && enrollment.status === 'completed');
  }

  async getAllLearningPaths() {
    return this.learningPathRepository.getAllLearningPaths();
  }

  async getLearningPathCourses(pathId: string) {
    const path = await this.learningPathRepository.getLearningPathById(pathId);
    if (!path) throw new Error('Learning path not found');
    return path.courses;
  }

  async getPurchasedCourses(userId: string): Promise<ICourse[]> {
    // Find all enrollments for the user with status 'completed', populate course
    const enrollments = await this.enrollmentRepository.findEnrollmentsWithDetails({
      studentId: userId,
      status: 'completed',
      populate: ['course']
    });
    // Return the populated course objects
    return enrollments.map(e => e.course).filter(Boolean);
  }
} 