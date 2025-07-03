import {Router} from "express"
import {Authcontroller} from "../controllers/implementations/auth.controller"
import {AuthRepository} from "../repository/implementations/auth.repository"
import {OtpRepository} from "../repository/implementations/otp.repository"
import {AuthService} from "../services/implementation/auth.services"
import passport from "../config/passport.config"
import express from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { UserController } from '../controllers/implementations/user.controller';
import { UserService } from '../services/implementation/user.services';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { UserRepository } from '../repository/implementations/user.repository';

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository()
const authService = new AuthService(authRepository,otpRepository);
const authController = new Authcontroller(authService);

// Initialize user controller and service
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
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

// Move enrolled check route here so it is protected
router.get('/courses/:courseId/enrolled', userController.isEnrolledInCourse.bind(userController));

// Profile routes
router.get('/profile', userController.getProfile.bind(userController));
router.put('/profile', userController.updateProfile.bind(userController));
router.post('/upload-profile-picture', upload.single('profilePicture'), userController.uploadProfilePicture.bind(userController));
router.put('/change-password', userController.changePassword.bind(userController));

// After router.use(authMiddleware); and router.use(roleMiddleware(['user']));
router.post('/courses/:courseId/lectures/:lectureIndex/complete', userController.completeLecture.bind(userController));
router.get('/courses/:courseId/progress', userController.getLectureProgress.bind(userController));

export default router