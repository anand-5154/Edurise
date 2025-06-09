import {Router} from "express"
import { InstructorAuth } from "../repository/implementations/instructorAuth.repository"
import { InstructorAuthController } from "../controllers/implementations/instructorAuth.controller"
import { InstructorAuthSerivce } from "../services/implementation/instructorAuth.services"
import { OtpRepository } from "../repository/implementations/otp.repository"
import { InstructorController } from "../controllers/implementations/instructor.controller"
import { InstructorService } from "../services/implementation/instructor.services"
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware"


const instructorAuthRepository=new InstructorAuth()
const otpRepository=new OtpRepository()
const instructorAuthService=new InstructorAuthSerivce(instructorAuthRepository,otpRepository)
const instructorAuthController=new InstructorAuthController(instructorAuthService)
const instructorService = new InstructorService(instructorAuthRepository)
const instructorController = new InstructorController(instructorService)

const router=Router()

router.post("/register",instructorAuthController.signup.bind(instructorAuthController))
router.post("/login",instructorAuthController.signin.bind(instructorAuthController))
router.post("/verify-otp",instructorAuthController.verifyOtp.bind(instructorAuthController))
router.post("/forgotpassword", instructorAuthController.forgotPassword.bind(instructorAuthController))
router.post("/reset-verify-otp", instructorAuthController.verifyForgotOtp.bind(instructorAuthController))
router.put("/resetpassword", instructorAuthController.resetPassword.bind(instructorAuthController))
router.post("/resend-otp",instructorAuthController.resentOtp.bind(instructorAuthController))
router.get("/dashboard", authMiddleware, roleMiddleware(['instructor']), instructorController.getDashboardStats.bind(instructorController))
router.post("/courses", authMiddleware, roleMiddleware(['instructor']), instructorController.createCourse.bind(instructorController))
router.get("/courses", authMiddleware, roleMiddleware(['instructor']), instructorController.getCourses.bind(instructorController))
router.get("/courses/:courseId", authMiddleware, roleMiddleware(['instructor']), instructorController.getCourseById.bind(instructorController))
router.put("/courses/:courseId", authMiddleware, roleMiddleware(['instructor']), instructorController.updateCourse.bind(instructorController))

export default router