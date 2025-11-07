import { IInstructorAuthService } from "../interfaces/instructorAuth.services";
import { IInstructorAuthRepository } from "../../repository/interfaces/IinstructorAuth.interface";
import { IInstructor } from "../../models/interfaces/IinstructorAuth.interface";
import bcrypt from "bcrypt";
import generateOtp, { otpExpiry } from "../../utils/otpGenerator";
import { IOtpRepository } from "../../repository/interfaces/Iotp.interface";
import { IAuthRepository } from "../../repository/interfaces/Iauth.interface";
import { IAdminRepository } from "../../repository/interfaces/Iadmin.interface";
import { sendMail } from "../../utils/sendMail";
import { generateRefreshToken, generateToken } from "../../utils/jwt";
import cloudinary from "../../config/cloudinary.config";
import { ICourseRepository } from "../../repository/interfaces/Icourse.interface";
import { IReviewRepository } from "../../repository/interfaces/Ireview.interface";
import { IOrderRepository } from "../../repository/interfaces/Iorder.interace";
import {
  ITransaction,
  IWallet,
} from "../../models/interfaces/Iwallet.interface";
import { IWalletRepository } from "../../repository/interfaces/Iwallet.interface";
import { ICategoryRepository } from "../../repository/interfaces/Icategory.interface";
import { IEnrollment } from "../../types/enrollment.types";
import { INotificationRepository } from "../../repository/interfaces/Inotification.interface";
import { InstructorDTO } from "../../DTO/instructor.dto";
import { toInstructorDTO } from "../../Mappers/instructor.mapper";
import { CourseDTO } from "../../DTO/course.dto";
import { toCourseDTO, toCourseDTOList } from "../../Mappers/course.mapper";
import { ReviewDTO } from "../../DTO/review.dto";
import { toReviewDTOList } from "../../Mappers/review.mapper";
import { NotificationDTO } from "../../DTO/notification.dto";
import {
  toNotificationDTO,
  toNotificationDTOList,
} from "../../Mappers/notification.mapper";
import { CategoryDTO } from "../../DTO/category.dto";
import { toCategoryDTOList } from "../../Mappers/category.mapper";
import { UserDTO } from "../../DTO/user.dto";
import { toUserDTOList } from "../../Mappers/user.mapper";
import {
  IInstructorQuizResponse,
  IQuiz,
} from "../../models/interfaces/Iquiz.interface";
import { IQuizRepository } from "../../repository/interfaces/Iquiz.interface";
import { QuizDTO } from "../../DTO/quiz.dto";
import { toQuizDTO } from "../../Mappers/quiz.mapper";
import { IProgressRepository } from "../../repository/interfaces/Iprogress.interface";
import { CourseProgressListDTO } from "../../DTO/courseProgressByUser.dto";

interface Dashboard {
  totalUsers: number;
  totalCourses: number;
}

export class InstructorAuthSerivce implements IInstructorAuthService {
  constructor(
    private _instructorAuthRepository: IInstructorAuthRepository,
    private _otpRepository: IOtpRepository,
    private _adminRepository: IAdminRepository,
    private _userRepository: IAuthRepository,
    private _courseRepository: ICourseRepository,
    private _reviewRepository: IReviewRepository,
    private _orderRepository: IOrderRepository,
    private _walletRepository: IWalletRepository,
    private _categoryRepository: ICategoryRepository,
    private _notificationRepository: INotificationRepository,
    private _quizRepository: IQuizRepository,
    private _progressRepository: IProgressRepository
  ) {}

  async registerInstructor(email: string): Promise<void> {
    const existingAdmin = await this._adminRepository.findAdminByEmail(email);
    if (existingAdmin) {
      throw new Error(
        "This email is used by admin. Please register with new one"
      );
    }
    const existingUser = await this._userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error(
        "This email is used by user. Please register with new one"
      );
    }
    const existing = await this._instructorAuthRepository.findByEmail(email);
    if (existing) {
      throw new Error("Instructor already exists");
    }

    const otp = generateOtp();

    await this._otpRepository.saveOTP({
      email: email,
      otp: otp,
      expiresAt: otpExpiry,
    });

    await sendMail(email, otp);
  }

  async verifyOtp(data: IInstructor & { otp: string }): Promise<{
    instructor: InstructorDTO;
    token: string;
    instructorRefreshToken: string;
  }> {
    const otpRecord = await this._otpRepository.findOtpbyEmail(data.email);

    if (!otpRecord) throw new Error("OTP not found");

    if (otpRecord.otp !== data.otp) {
      throw new Error("Invalid OTP");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const instructor = await this._instructorAuthRepository.createInstructor({
      ...data,
      password: hashedPassword,
      resume: data.resume,
    });

    await this._otpRepository.deleteOtpbyEmail(data.email);

    const token = generateToken(instructor._id, instructor.email, "instructor");
    const instructorRefreshToken = generateRefreshToken(
      instructor._id,
      instructor.email,
      "instructor"
    );

    return {
      instructor: toInstructorDTO(instructor),
      token,
      instructorRefreshToken,
    };
  }

  async reApplyS(email: string, resume: string): Promise<InstructorDTO> {
    const instructor = await this._instructorAuthRepository.findByEmail(email);

    if (!instructor) throw new Error("Instructor not found");

    const updatedData: Partial<IInstructor> = {
      resume: resume,
      isVerified: false,
      isRejected: false,
      accountStatus: "pending",
    };

    const updated = await this._instructorAuthRepository.updateInstructor(
      instructor.email,
      updatedData
    );
    if (!updated) {
      throw new Error("failed to reapply");
    }
    return toInstructorDTO(updated);
  }

  async loginInstructor(
    email: string,
    password: string
  ): Promise<{
    instructor: InstructorDTO;
    token: string;
    instructorRefreshToken: string;
  }> {
    // Log the email being searched for
    console.log("Attempting login for email:", email);

    const instructor = await this._instructorAuthRepository.findByEmail(email);

    if (!instructor) {
      console.log("No instructor found for email:", email);
      throw new Error("Instructor not registered");
    }

    // Log the instructor state (but not the password)
    console.log("Found instructor:", {
      id: instructor._id,
      email: instructor.email,
      isBlocked: instructor.isBlocked,
      isVerified: instructor.isVerified,
      accountStatus: instructor.accountStatus
    });

    if (instructor.isBlocked) {
      console.log("Instructor is blocked:", email);
      throw new Error("Instructor is blocked");
    }

    if (!instructor.isVerified || instructor.accountStatus !== 'active') {
      console.log("Instructor account not active:", {
        isVerified: instructor.isVerified,
        accountStatus: instructor.accountStatus
      });
      throw new Error("Account not active. Please verify your account or wait for admin approval.");
    }

    console.log("Comparing passwords for:", email);
    console.log("Password comparison debug:", {
      providedPassword: password,
      storedHash: instructor.password,
      hashFormat: instructor.password.substring(0, 7), // Should show "$2b$10$"
    });

    // Try both the provided password and a known test case
    const testPasswords = [
      password,
      'Arun@1234',
      'arun@1234',
      'Arun@123',
      password.trim() // In case there's whitespace
    ];

    for (const testPassword of testPasswords) {
      const match = await bcrypt.compare(testPassword, instructor.password);
      console.log(`Test password "${testPassword}": ${match ? 'MATCH' : 'NO MATCH'}`);
      
      // Generate a new hash for comparison
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`New hash for "${testPassword}":`, newHash);
    }

    const isMatch = await bcrypt.compare(password, instructor.password);

    if (!isMatch) {
      console.log("Password mismatch for:", email);
      throw new Error("Invalid password");
    }

    const token = generateToken(instructor._id, instructor.email, "instructor");
    const instructorRefreshToken = generateRefreshToken(
      instructor._id,
      instructor.email,
      "instructor"
    );

    return {
      instructor: toInstructorDTO(instructor),
      token,
      instructorRefreshToken,
    };
  }

  async handleForgotPassword(email: string): Promise<void> {
    const instructor = await this._instructorAuthRepository.findByEmail(email);

    if (!instructor) {
      throw new Error("No Instructor found");
    }

    const otp = generateOtp();

    await this._otpRepository.saveOTP({
      email: email,
      otp: otp,
      expiresAt: otpExpiry,
    });

    await sendMail(email, otp);
  }

  async verifyForgotOtp(data: {
    email: string;
    otp: string;
  }): Promise<boolean> {
    const otpRecord = await this._otpRepository.findOtpbyEmail(data.email);

    if (!otpRecord) {
      throw new Error("Couldn't find otp in email");
    }

    if (otpRecord.otp !== data.otp) {
      throw new Error("otp doesn't match");
    }

    await this._otpRepository.deleteOtpbyEmail(data.email);

    return true;
  }

  async handleResetPassword(data: {
    email: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<boolean> {
    const instructor = await this._instructorAuthRepository.findByEmail(
      data.email
    );

    if (!instructor) {
      throw new Error("User not found");
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new Error("Password didn't match");
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    instructor.password = hashedPassword;
    await instructor.save();

    return true;
  }

  async handleResendOtp(email: string): Promise<void> {
    const instructor = await this._otpRepository.findOtpbyEmail(email);

    if (!instructor) {
      throw new Error("NO instructor found");
    }

    const otp = generateOtp();

    await this._otpRepository.saveOTP({
      email: email,
      otp: otp,
      expiresAt: otpExpiry,
    });

    await sendMail(email, otp);
  }

  async getProfileService(email: string): Promise<InstructorDTO> {
    const instructor =
      await this._instructorAuthRepository.findForProfile(email);
    if (!instructor) {
      throw new Error("Inbstructor not exist");
    }

    return toInstructorDTO(instructor);
  }

  async updateProfileService(
    email: string,
    {
      name,
      phone,
      title,
      yearsOfExperience,
      education,
      profilePicture,
    }: {
      name?: string;
      phone?: string;
      profilePicture?: Express.Multer.File;
      title?: string;
      yearsOfExperience?: number;
      education?: string;
    }
  ): Promise<InstructorDTO> {
    const updateFields: Partial<{
      name: string;
      phone: string;
      title: string;
      yearsOfExperience: number;
      education: string;
      profilePicture: string;
    }> = {
      name,
      phone,
      title,
      yearsOfExperience,
      education,
    };

    if (profilePicture?.path) {
      const result = await cloudinary.uploader.upload(profilePicture.path, {
        folder: "profilePicture",
        use_filename: true,
        unique_filename: true,
      });

      updateFields.profilePicture = result.secure_url;
    }

    const instructor =
      await this._instructorAuthRepository.updateInstructorByEmail(
        email,
        updateFields
      );

    if (!instructor) throw new Error("Instructor not found");

    return toInstructorDTO(instructor);
  }

  async getCoursesByInstructor(
    instructorId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ courses: CourseDTO[]; total: number; totalPages: number }> {
    const { courses, total, totalPages } =
      await this._courseRepository.findCoursesByInstructor(
        instructorId,
        page,
        limit,
        search
      );
    return { courses: toCourseDTOList(courses), total, totalPages };
  }

  async getCourseById(courseId: string): Promise<CourseDTO> {
    const course = await this._courseRepository.findCourseById(courseId);
    if (!course) {
      throw new Error("No Course Found");
    }
    return toCourseDTO(course);
  }

  async getCategory(): Promise<CategoryDTO[]> {
    const categories = await this._categoryRepository.getCatgeoriesInstructor();
    if (!categories) {
      throw new Error("No categories found");
    }
    return toCategoryDTOList(categories);
  }

  async getReviewsByInstructor(
    instructorId: string,
    page: number,
    limit: number,
    rating: number
  ): Promise<{ reviews: ReviewDTO[]; total: number; totalPages: number }> {
    const { reviews, total, totalPages } =
      await this._reviewRepository.getReviewsByInstructor(
        instructorId,
        page,
        limit,
        rating
      );
    return { reviews: toReviewDTOList(reviews), total, totalPages };
  }

  async getEnrollments(
    instructorId: string,
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{
    enrollments: IEnrollment[];
    total: number;
    totalPages: number;
  }> {
    const enrollments = await this._orderRepository.getEnrollmentsByInstructor(
      instructorId,
      page,
      limit,
      search,
      status
    );
    return enrollments;
  }

  async getWallet(
    instructorId: string,
    page: number,
    limit: number
  ): Promise<{
    wallet: Partial<IWallet>;
    total: number;
    totalPages: number;
    transactions: ITransaction[];
  }> {
    const wallet = await this._walletRepository.findWalletOfInstructor(
      instructorId,
      page,
      limit
    );

    if (!wallet) {
      throw new Error("No wallet found for the instructor");
    }

    return wallet;
  }

  async getCouresStats(
    instructorId: string
  ): Promise<{ title: string; enrolledCount: number }[]> {
    return await this._courseRepository.getCourseStatsOfInstructor(
      instructorId
    );
  }

  async getDashboard(instructorId: string): Promise<Dashboard | null> {
    return await this._instructorAuthRepository.getDashboard(instructorId);
  }

  async getIncomeStats(
    instructorId: string
  ): Promise<{ month: string; revenue: number }[]> {
    return await this._walletRepository.getIncome(instructorId);
  }

  async getNotifications(userId: string): Promise<NotificationDTO[]> {
    const notification =
      await this._notificationRepository.getAllNotifications(userId);
    return toNotificationDTOList(notification);
  }

  async markAsRead(notificationId: string): Promise<NotificationDTO> {
    const notification =
      await this._notificationRepository.updateNotification(notificationId);
    if (!notification) {
      throw new Error("failed to update notification");
    }
    return toNotificationDTO(notification);
  }

  async getPurchasedUsers(instructorId: string): Promise<UserDTO[]> {
    const userIds =
      await this._courseRepository.getUsersByInstructor(instructorId);

    if (!userIds.length) return [];

    const users = await this._userRepository.findUsersByIds(userIds);
    return toUserDTOList(users);
  }

  async createQuiz(
    instructorId: string,
    quiz: Partial<IQuiz>,
    courseID: string
  ): Promise<QuizDTO> {
    const course = await this._courseRepository.findCourseByIdAndInstructor(
      courseID,
      instructorId
    );

    const Quiz = await this._quizRepository.findQuizByCouseId(courseID);

    if (Quiz) {
      throw new Error("Quiz is already created for this course");
    }

    if (!course) {
      throw new Error("You are not allowed to create a quiz for this course");
    }

    const quizData: Partial<IQuiz> = {
      ...quiz,
      courseId: courseID,
      instructorId: instructorId,
    };

    const createdQuiz = await this._quizRepository.createQuiz(quizData);
    if(!createdQuiz){
      throw new Error("failed to create quiz")
    }
    return toQuizDTO(createdQuiz);
  }

  async updateQuiz(
    quizId: string,
    updateData: Partial<IQuiz>
  ): Promise<QuizDTO> {
    const existing = await this._quizRepository.findQuizById(quizId);
    if (!existing) {
      throw new Error("quiz not found");
    }

    if (!updateData.questions || !Array.isArray(updateData.questions)) {
      throw new Error("Invalid questions data");
    }
    const updatedQuiz = await this._quizRepository.updateQuizById(quizId, updateData);
    if(!updatedQuiz){
      throw new Error("failed to update the quiz")
    }
    return toQuizDTO(updatedQuiz);
  }

  async getQuizzes(
    instructor: string
  ): Promise<IInstructorQuizResponse[] | null> {
    const quizzes = await this._quizRepository.findByInstructorId(instructor);

    if (!quizzes) {
      throw new Error("No quizzes found");
    }

    return quizzes.map((q) => ({
      _id: q._id?.toString() || "",
      title: q.title,
      courseTitle:
        typeof q.courseId === "object" && "title" in q.courseId
          ? q.courseId.title
          : "Untitled Course",
      totalQuestions: q.questions.length,
      isDeleted: q.isDeleted,
      createdAt: q.createdAt,
    }));
  }

  async deleteQuiz(quizId: string): Promise<QuizDTO> {
    const quiz = await this._quizRepository.findQuizById(quizId);

    if (!quiz) {
      throw new Error("No quiz found");
    }

    const updated = await this._quizRepository.changeStatus(quizId, true);
    if(!updated){
      throw new Error("failed to delete the quiz")
    }
    return toQuizDTO(updated)
  }

  async restoreQuiz(quizId: string): Promise<QuizDTO> {
    const quiz = await this._quizRepository.findQuizById(quizId);

    if (!quiz) {
      throw new Error("No quiz found");
    }

    const updated = await this._quizRepository.changeStatus(quizId, false);
    if(!updated){
      throw new Error("failed to delete the quiz")
    }
    return toQuizDTO(updated)
  }

  async getQuiz(quizId: string): Promise<QuizDTO> {
    const quiz = await this._quizRepository.findQuizById(quizId);

    if (!quiz) {
      throw new Error("No quiz found");
    }

    return toQuizDTO(quiz);
  }

  async getCourseProgressByUser(
    instructorId: string,
    courseId: string,
    page: number,
    limit: number,
    search?: string
  ): Promise<CourseProgressListDTO> {
    return await this._progressRepository.getCourseProgressByUser(
      instructorId,
      courseId,
      page,
      limit,
      search
    );
  }
}
