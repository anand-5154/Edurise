import {Router} from "express"
import { InstructorAuth } from "../repository/implementations/instructorAuth.repository"
import { InstructorAuthController } from "../controllers/implementations/instructorAuth.controller"
import { InstructorAuthSerivce } from "../services/implementation/instructorAuth.services"
import { OtpRepository } from "../repository/implementations/otp.repository"
import { InstructorController } from "../controllers/implementations/instructor.controller"
import { InstructorService } from "../services/implementation/instructor.services"
import { authMiddleware, roleMiddleware } from "../middleware/auth.middleware"
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { httpStatus } from "../constants/statusCodes";
import { CourseRepository } from "../repository/implementations/course.repository";
import { EnrollmentRepository } from "../repository/implementations/enrollment.repository";
import { InstructorBankInfoRepository } from '../repository/implementations/instructorBankInfo.repository';
import { UserRepository } from '../repository/implementations/user.repository';
import { LectureProgressRepository } from '../repository/implementations/lectureProgress.repository';


const instructorAuthRepository=new InstructorAuth()
const otpRepository=new OtpRepository()
const instructorBankInfoRepository = new InstructorBankInfoRepository();
const instructorAuthService=new InstructorAuthSerivce(instructorAuthRepository,otpRepository)
const instructorAuthController=new InstructorAuthController(instructorAuthService)
const courseRepository = new CourseRepository();
const enrollmentRepository = new EnrollmentRepository();
const userRepository = new UserRepository();
const lectureProgressRepository = new LectureProgressRepository();
const instructorService = new InstructorService(
  instructorAuthRepository,
  courseRepository,
  enrollmentRepository,
  undefined, // messageRepository
  undefined, // moduleRepository
  undefined, // lectureRepository
  userRepository, // <-- Pass the instance here!
  lectureProgressRepository, // <-- Pass the instance here!
  instructorBankInfoRepository
);
const instructorController = new InstructorController(instructorService);

const router=Router()

// Explicitly configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    public_id: (req, file) => `instructor-profiles/${Date.now()}-${file.originalname}`,
    // transformation is not a supported top-level param, so remove it if linter complains
  },
});
const upload = multer({ storage });

const courseMediaStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Use original filename, but prefix with course-media/
    const ext = file.originalname.split('.').pop();
    return {
      public_id: `course-media/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`,
      resource_type: 'auto',
      format: ext,
    };
  },
});
const uploadCourseMedia = multer({ storage: courseMediaStorage });

router.post("/register",instructorAuthController.signup.bind(instructorAuthController))
router.post("/login",instructorAuthController.signin.bind(instructorAuthController))
router.post("/verify-otp",instructorAuthController.verifyOtp.bind(instructorAuthController))
router.post("/forgotpassword", instructorAuthController.forgotPassword.bind(instructorAuthController))
router.post("/reset-verify-otp", instructorAuthController.verifyForgotOtp.bind(instructorAuthController))
router.put("/resetpassword", instructorAuthController.resetPassword.bind(instructorAuthController))
router.post("/resend-otp",instructorAuthController.resentOtp.bind(instructorAuthController))
router.post("/refresh-token", instructorAuthController.refreshToken.bind(instructorAuthController));
router.get("/dashboard", authMiddleware, roleMiddleware(['instructor']), instructorController.getDashboardStats.bind(instructorController))
router.post("/courses", authMiddleware, roleMiddleware(['instructor']), instructorController.createCourse.bind(instructorController))
router.get("/courses", authMiddleware, roleMiddleware(['instructor']), instructorController.getCourses.bind(instructorController))
router.get("/courses/:courseId", authMiddleware, roleMiddleware(['instructor']), instructorController.getCourseById.bind(instructorController))
router.put("/courses/:courseId", authMiddleware, roleMiddleware(['instructor']), instructorController.updateCourse.bind(instructorController))
router.get('/courses/:courseId/progress', instructorController.getCourseLectureProgress.bind(instructorController));

// Instructor profile routes
router.get(
  '/profile',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.getProfile.bind(instructorController)
);
router.put(
  '/profile',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.updateProfile.bind(instructorController)
);
router.post(
  '/upload-profile-picture',
  authMiddleware,
  roleMiddleware(['instructor']),
  upload.single('profilePicture'),
  instructorController.uploadProfilePicture.bind(instructorController)
);
router.put(
  '/change-password',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.changePassword.bind(instructorController)
);

router.post(
  '/upload-course-media',
  authMiddleware,
  roleMiddleware(['instructor']),
  uploadCourseMedia.single('media'),
  (req: any, res) => {
    if (!req.file || !req.file.path) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'No file uploaded' });
      return;
    }
    res.status(httpStatus.OK).json({ url: req.file.path });
  }
);

router.post(
  '/upload-registration-document',
  uploadCourseMedia.single('media'),
  (req: any, res) => {
    if (!req.file || !req.file.path) {
      res.status(httpStatus.BAD_REQUEST).json({ message: 'No file uploaded' });
      return;
    }
    res.status(httpStatus.OK).json({ url: req.file.path });
  }
);

// Bank/payment info management
router.get(
  '/bank-info',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.getBankInfo.bind(instructorController)
);
router.post(
  '/bank-info',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.upsertBankInfo.bind(instructorController)
);
router.put(
  '/bank-info',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.upsertBankInfo.bind(instructorController)
);
router.delete(
  '/bank-info',
  authMiddleware,
  roleMiddleware(['instructor']),
  instructorController.deleteBankInfo.bind(instructorController)
);

export default router