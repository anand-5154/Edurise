import express from 'express';
import { AdminController } from '../controllers/implementations/admin.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { AdminRepository } from '../repository/implementations/admin.repository';
import { InstructorAuth } from '../repository/implementations/instructorAuth.repository';
import { CourseRepository } from '../repository/implementations/course.repository';
import { AdminService } from '../services/implementation/admin.sevices';

const router = express.Router();

// Initialize repositories
const adminRepository = new AdminRepository();
const instructorRepository = new InstructorAuth();
const courseRepository = new CourseRepository();

// Initialize service
const adminService = new AdminService(adminRepository, instructorRepository, courseRepository, instructorRepository);

// Initialize controller
const adminController = new AdminController(adminService);

// Public routes
router.post('/login', adminController.login.bind(adminController));

// Protected routes
// Dashboard stats
router.get('/stats', authMiddleware, roleMiddleware(['admin']), adminController.getDashboardStats.bind(adminController));

// User management
router.get('/users', authMiddleware, roleMiddleware(['admin']), adminController.getAllUsers.bind(adminController));
router.put('/users/:userId/block', authMiddleware, roleMiddleware(['admin']), adminController.blockUser.bind(adminController));
router.put('/users/:userId/unblock', authMiddleware, roleMiddleware(['admin']), adminController.unblockUser.bind(adminController));

// Instructor management
router.get('/instructors', authMiddleware, roleMiddleware(['admin']), adminController.getAllInstructors.bind(adminController));
router.put('/instructors/:instructorId/verify', authMiddleware, roleMiddleware(['admin']), adminController.verifyInstructor.bind(adminController));
router.put('/instructors/:instructorId/reject', authMiddleware, roleMiddleware(['admin']), adminController.rejectInstructor.bind(adminController));

// Course management
router.get('/courses', authMiddleware, roleMiddleware(['admin']), adminController.getAllCourses.bind(adminController));
router.delete('/courses/:courseId', authMiddleware, roleMiddleware(['admin']), adminController.deleteCourse.bind(adminController));
router.put('/courses/:courseId/status', authMiddleware, roleMiddleware(['admin']), adminController.updateCourseStatus.bind(adminController));

// Category management
router.get('/categories', authMiddleware, roleMiddleware(['admin']), adminController.getCategories.bind(adminController));
router.post('/categories', authMiddleware, roleMiddleware(['admin']), adminController.createCategory.bind(adminController));
router.put('/categories/:id', authMiddleware, roleMiddleware(['admin']), adminController.updateCategory.bind(adminController));
router.delete('/categories/:id', authMiddleware, roleMiddleware(['admin']), adminController.deleteCategory.bind(adminController));

export default router;