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

const authRepository = new AuthRepository();
const otpRepository = new OtpRepository()
const authService = new AuthService(authRepository,otpRepository);
const authController = new Authcontroller(authService);

// Initialize user controller and service
const userService = new UserService();
const userController = new UserController(userService);

const router=Router()

router.post("/register",authController.signup.bind(authController))
router.post("/login",authController.signin.bind(authController))
router.post("/verify-otp",authController.verifyOtp.bind(authController))
router.post("/forgotpassword",authController.forgotPassword.bind(authController))
router.post("/reset-verify-otp",authController.verifyForgotOtp.bind(authController))
router.put("/resetpassword",authController.resetPassword.bind(authController))
router.post("/resend-otp",authController.resentOtp.bind(authController))
router.get("/auth/google",passport.authenticate("google",{scope:["profile","email"],session:false}))
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/register", session: false }),
  authController.googleAuth.bind(authController))

// Public routes
router.get('/courses', userController.getAllCourses.bind(userController));
router.get('/courses/:courseId', userController.getCourseById.bind(userController));
router.get('/categories', userController.getAllCategories.bind(userController));

// Protected routes
router.use(authMiddleware);
router.use(roleMiddleware(['user']));

export default router