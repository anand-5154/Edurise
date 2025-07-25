import express from "express";
import { AdminController } from "../controllers/implementations/admin.controller";
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware";
import { AdminRepository } from "../repository/implementations/admin.repository";
import { InstructorAuth } from "../repository/implementations/instructorAuth.repository";
import { CourseRepository } from "../repository/implementations/course.repository";
import { AdminService } from "../services/implementation/admin.sevices";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { UserRepository } from '../repository/implementations/user.repository';
import { CategoryRepository } from "../repository/implementations/category.repository";
import { LearningPathRepository } from '../repository/implementations/learningPath.repository';
import { ModuleRepository } from "../repository/implementations/module.repository";
import LearningPath from '../models/implementations/learningPathModel';
import { PaymentService } from '../services/implementation/payment.service';

const router = express.Router();

// Initialize repositories
const adminRepository = new AdminRepository();
const instructorRepository = new InstructorAuth();
const courseRepository = new CourseRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const learningPathRepository = new LearningPathRepository();
const moduleRepository = new ModuleRepository();

// Initialize service
const paymentService = new PaymentService();

const adminService = new AdminService(
  adminRepository,
  instructorRepository,
  courseRepository,
  paymentService,         // <-- Pass PaymentService here!
  instructorRepository,
  userRepository,
  categoryRepository,
  moduleRepository
);

// Initialize controller
const adminController = new AdminController(adminService);

// Explicitly configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => ({
    folder: 'admin-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  }),
});
const upload = multer({ storage });

// Public routes
router.post("/login", adminController.login.bind(adminController));
router.post("/refresh-token", adminController.refreshToken.bind(adminController));

// Protected routes
// Dashboard stats
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getDashboardStats.bind(adminController)
);

// User management
router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getAllUsers.bind(adminController)
);
router.put(
  "/users/:userId/block",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.blockUser.bind(adminController)
);
router.put(
  "/users/:userId/unblock",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.unblockUser.bind(adminController)
);
router.get(
  "/users/:userId/details",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getUserDetailsWithProgress.bind(adminController)
);

// Instructor management
router.get(
  "/instructors",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getAllInstructors.bind(adminController)
);
router.put(
  "/instructors/:instructorId/verify",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.verifyInstructor.bind(adminController)
);
router.put(
  "/instructors/:instructorId/reject",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.rejectInstructor.bind(adminController)
);
router.post('/instructors/:id/block', authMiddleware, adminController.blockInstructor.bind(adminController));
router.post('/instructors/:id/unblock', authMiddleware, adminController.unblockInstructor.bind(adminController));

// Course management
router.get(
  "/courses",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getAllCourses.bind(adminController)
);
router.get(
  "/courses/:courseId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getCourseById.bind(adminController)
);
router.delete(
  "/courses/:courseId",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.deleteCourse.bind(adminController)
);
router.put(
  "/courses/:courseId/status",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.updateCourseStatus.bind(adminController)
);

// Category management
router.get(
  "/categories",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getCategories.bind(adminController)
);
router.post(
  "/categories",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.createCategory.bind(adminController)
);
router.put(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.updateCategory.bind(adminController)
);
router.delete(
  "/categories/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.deleteCategory.bind(adminController)
);

// Admin profile routes
router.get(
  '/profile',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.getProfile.bind(adminController)
);
router.put(
  '/profile',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.updateProfile.bind(adminController)
);
router.post(
  '/upload-profile-picture',
  authMiddleware,
  roleMiddleware(['admin']),
  upload.single('profilePicture'),
  adminController.uploadProfilePicture.bind(adminController)
);
router.put(
  '/change-password',
  authMiddleware,
  roleMiddleware(['admin']),
  adminController.changePassword.bind(adminController)
);

router.get(
  "/reports/user-activity",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getUserActivityReport.bind(adminController)
);

router.get(
  "/reports/course-performance",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getCoursePerformanceReport.bind(adminController)
);

router.get(
  "/reports/user-activity-by-course",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getUserActivityReportByCourse.bind(adminController)
);

// User trends (top users)
router.get(
  "/reports/user-trends",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getUserTrends.bind(adminController)
);

// Course trends (top courses)
router.get(
  "/reports/course-trends",
  authMiddleware,
  roleMiddleware(["admin"]),
  adminController.getCourseTrends.bind(adminController)
);

// Learning Path management
router.get(
  '/learning-paths',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const paths = await learningPathRepository.getAllLearningPaths();
      res.json(paths);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.get(
  '/learning-paths/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const path = await learningPathRepository.getLearningPathById(req.params.id);
      if (!path) {
        res.status(404).json({ message: 'Learning path not found' });
        return;
      }
      res.json(path);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Create a learning path
router.post(
  '/learning-paths',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const { name, description, courses } = req.body;
      const path = await learningPathRepository.createLearningPath({ name, description, courses });
      res.status(201).json(path);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Update a learning path
router.put(
  '/learning-paths/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      const path = await learningPathRepository.updateLearningPath(req.params.id, req.body);
      res.json(path);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

// Delete a learning path
router.delete(
  '/learning-paths/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  async (req, res) => {
    try {
      await learningPathRepository.deleteLearningPath(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

export default router;
