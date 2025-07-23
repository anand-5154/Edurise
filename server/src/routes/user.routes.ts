import {Router} from "express"
import {Authcontroller} from "../controllers/implementations/auth.controller"
import {AuthRepository} from "../repository/implementations/auth.repository"
import {OtpRepository} from "../repository/implementations/otp.repository"
import {AuthService} from "../services/implementation/auth.services"
import passport from "../config/passport.config"
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { UserController } from '../controllers/implementations/user.controller';
import { UserService } from '../services/implementation/user.services';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { UserRepository } from '../repository/implementations/user.repository';
import { CategoryRepository } from '../repository/implementations/category.repository';
import { CourseRepository } from '../repository/implementations/course.repository';
import { ModuleRepository } from '../repository/implementations/module.repository';
import { LectureRepository } from '../repository/implementations/lecture.repository';
import { EnrollmentRepository } from '../repository/implementations/enrollment.repository';
import { LectureProgressRepository } from '../repository/implementations/lectureProgress.repository';
import { LearningPathRepository } from '../repository/implementations/learningPath.repository';

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository()
const authService = new AuthService(authRepository,otpRepository);
const authController = new Authcontroller(authService);

// Initialize user controller and service
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const courseRepository = new CourseRepository();
const moduleRepository = new ModuleRepository();
const lectureRepository = new LectureRepository();
const enrollmentRepository = new EnrollmentRepository();
const lectureProgressRepository = new LectureProgressRepository();
const learningPathRepository = new LearningPathRepository();
const userService = new UserService(userRepository, courseRepository, moduleRepository, lectureRepository, categoryRepository, enrollmentRepository, lectureProgressRepository, learningPathRepository);
const userController = new UserController(userService);

const router=Router()

router.post("/register",authController.signup.bind(authController))
router.post("/login",authController.signin.bind(authController))
router.post("/verify-otp",authController.verifyOtp.bind(authController))
router.post("/forgotpassword",authController.forgotPassword.bind(authController))
router.post("/reset-verify-otp",authController.verifyForgotOtp.bind(authController))
router.put("/resetpassword",authController.resetPassword.bind(authController))
router.post("/resend-otp",authController.resentOtp.bind(authController))
router.post("/refresh-token", authController.refreshToken.bind(authController));
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],session:false}))
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/register", session: false }),
  authController.googleAuth.bind(authController))

// Public routes
router.get('/courses', userController.getAllCourses.bind(userController));
router.get('/courses/:courseId', userController.getCourseById.bind(userController));
router.get('/categories', userController.getAllCategories.bind(userController));

// Learning Path routes
router.get('/learning-paths', async (req, res) => {
  try {
    const paths = await userService.getAllLearningPaths();
    res.json(paths);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
});

router.get('/learning-paths/:pathId/courses', async (req, res) => {
  try {
    const courses = await userService.getLearningPathCourses(req.params.pathId);
    res.json(courses);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

// Explicitly configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user-profiles',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});
const upload = multer({ storage });

// Protected routes
router.use(authMiddleware);
router.use(roleMiddleware(['user']));

// Move this route below the middleware so req.user is set
router.get('/courses/:courseId/modules', (req, res, next) => {
  // @ts-ignore
  console.log('[ROUTE] /users/courses/:courseId/modules hit', req.params.courseId, req.user?.id);
  next();
}, userController.getModulesForCourse.bind(userController));

// Move enrolled check route here so it is protected
router.get('/courses/:courseId/enrolled', userController.isEnrolledInCourse.bind(userController));

// Add a route-level log for debugging lectures fetch
router.get('/modules/:moduleId/lectures', (req, res, next) => {
  // @ts-ignore
  console.log('[ROUTE] /users/modules/:moduleId/lectures hit', req.params.moduleId, req.user?.id);
  next();
}, userController.getLecturesForModule.bind(userController));

// Profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));
router.post('/upload-profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture.bind(userController));
router.put('/change-password', userController.changePassword.bind(userController));

// After router.use(authMiddleware); and router.use(roleMiddleware(['user']));
router.post('/courses/:courseId/lectures/:lectureIndex/complete', userController.completeLecture.bind(userController));
router.get('/courses/:courseId/progress', userController.getLectureProgress.bind(userController));
// Add the route for marking a lecture as completed
router.post('/modules/:moduleId/lectures/:lectureId/complete', userController.completeLecture.bind(userController));

export default router